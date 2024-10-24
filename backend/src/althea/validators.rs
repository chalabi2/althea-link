use cosmos_sdk_proto_althea::cosmos::staking::v1beta1::{QueryValidatorsRequest, Validator};
use log::info;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ValidatorInfo {
    pub operator_address: String,
    pub consensus_pubkey: Option<String>,
    pub jailed: bool,
    pub status: i32,
    pub tokens: String,
    pub delegator_shares: String,
    pub description: Option<ValidatorDescription>,
    pub unbonding_height: i64,
    pub unbonding_time: Option<SystemTime>,
    pub commission: Option<ValidatorCommission>,
    pub min_self_delegation: String,
    pub last_updated: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ValidatorDescription {
    pub moniker: String,
    pub identity: String,
    pub website: String,
    pub security_contact: String,
    pub details: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ValidatorCommission {
    pub commission_rates: CommissionRates,
    pub update_time: SystemTime,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommissionRates {
    pub rate: String,
    pub max_rate: String,
    pub max_change_rate: String,
}

pub async fn fetch_validators(
    db: &rocksdb::DB,
    contact: &deep_space::Contact,
) -> Result<Vec<ValidatorInfo>, Box<dyn std::error::Error>> {
    info!("Fetching validators");
    let cached = get_cached_validators(db);
    if let Some(validators) = cached {
        return Ok(validators);
    }

    let request = QueryValidatorsRequest {
        status: String::new(),
        pagination: None,
    };

    let validators_list = contact.get_validators_list(request).await?;

    let validators: Vec<ValidatorInfo> = validators_list
        .into_iter()
        .map(ValidatorInfo::from)
        .collect();

    cache_validators(db, &validators);
    info!("Successfully fetched and stored validators");
    Ok(validators)
}

fn get_cached_validators(db: &rocksdb::DB) -> Option<Vec<ValidatorInfo>> {
    let key = b"validators";
    match db.get(key).unwrap() {
        Some(data) => {
            let validators: Vec<ValidatorInfo> = bincode::deserialize(&data).unwrap();
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();

            // Cache for 5 minutes
            if now - validators[0].last_updated < 300 {
                Some(validators)
            } else {
                None
            }
        }
        None => None,
    }
}

fn cache_validators(db: &rocksdb::DB, validators: &[ValidatorInfo]) {
    let key = b"validators";
    let encoded = bincode::serialize(validators).unwrap();
    db.put(key, encoded).unwrap();
}

impl From<Validator> for ValidatorInfo {
    fn from(v: Validator) -> Self {
        let commission_rates = v
            .commission
            .as_ref()
            .and_then(|c| c.commission_rates.as_ref())
            .map(|r| CommissionRates {
                rate: r.rate.clone(),
                max_rate: r.max_rate.clone(),
                max_change_rate: r.max_change_rate.clone(),
            });

        ValidatorInfo {
            operator_address: v.operator_address,
            consensus_pubkey: v
                .consensus_pubkey
                .map(|p| String::from_utf8_lossy(&p.value).to_string()),
            jailed: v.jailed,
            status: v.status,
            tokens: v.tokens,
            delegator_shares: v.delegator_shares,
            description: v.description.map(|d| ValidatorDescription {
                moniker: d.moniker,
                identity: d.identity,
                website: d.website,
                security_contact: d.security_contact,
                details: d.details,
            }),
            unbonding_height: v.unbonding_height,
            unbonding_time: v
                .unbonding_time
                .map(|t| SystemTime::UNIX_EPOCH + std::time::Duration::from_secs(t.seconds as u64)),
            commission: v.commission.map(|c| ValidatorCommission {
                commission_rates: commission_rates.unwrap(),
                update_time: SystemTime::UNIX_EPOCH
                    + std::time::Duration::from_secs(c.update_time.unwrap().seconds as u64),
            }),
            min_self_delegation: v.min_self_delegation,
            last_updated: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }
}
