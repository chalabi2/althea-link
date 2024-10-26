use bincode;
use deep_space::{Address as CosmosAddress, Contact};
use log::{error, info};
use rocksdb::DB;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use std::vec::Vec;

use crate::althea::CACHE_DURATION;
use tokio;

const DELEGATIONS_KEY_PREFIX: &[u8] = b"delegations:";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DelegationInfo {
    pub validator_address: String,
    pub delegator_address: String,
    pub shares: String,
    pub balance: Option<String>,
    pub last_updated: u64,
}

pub async fn fetch_delegations(
    db: &rocksdb::DB,
    contact: &Contact,
    delegator_address: CosmosAddress,
) -> Result<Vec<DelegationInfo>, Box<dyn std::error::Error>> {
    info!("Fetching delegations for {}", delegator_address);
    let cached = get_cached_delegations(db, &delegator_address);
    if let Some(delegations) = cached {
        return Ok(delegations);
    }

    // First get all validators this delegator has delegated to
    let validators = contact
        .query_delegator_validators(delegator_address)
        .await?;

    // For each validator, get the delegation details
    let mut delegations = Vec::new();
    for validator_addr in validators {
        let validator_address = CosmosAddress::from_bech32(validator_addr.clone())?;

        if let Some(delegation) = contact
            .get_delegation(validator_address, delegator_address)
            .await?
        {
            if let Some(del_response) = delegation.delegation {
                delegations.push(DelegationInfo {
                    validator_address: validator_addr,
                    delegator_address: delegator_address.to_string(),
                    shares: del_response.shares,
                    balance: delegation.balance.map(|b| b.amount),
                    last_updated: SystemTime::now()
                        .duration_since(UNIX_EPOCH)
                        .unwrap()
                        .as_secs(),
                });
            }
        }
    }

    cache_delegations(db, &delegator_address, &delegations);
    info!(
        "Successfully fetched and stored {} delegations for {}",
        delegations.len(),
        delegator_address
    );
    Ok(delegations)
}

fn get_cached_delegations(
    db: &rocksdb::DB,
    delegator: &CosmosAddress,
) -> Option<Vec<DelegationInfo>> {
    let key = [DELEGATIONS_KEY_PREFIX, delegator.to_string().as_bytes()].concat();

    match db.get(&key).unwrap() {
        Some(data) => {
            let delegations: Vec<DelegationInfo> = bincode::deserialize(&data).unwrap();
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();

            if !delegations.is_empty() && now - delegations[0].last_updated < CACHE_DURATION {
                Some(delegations)
            } else {
                None
            }
        }
        None => None,
    }
}

fn cache_delegations(db: &rocksdb::DB, delegator: &CosmosAddress, delegations: &[DelegationInfo]) {
    let key = [DELEGATIONS_KEY_PREFIX, delegator.to_string().as_bytes()].concat();

    let encoded = bincode::serialize(delegations).unwrap();
    db.put(key, encoded).unwrap();
}

pub fn start_delegation_cache_refresh_task(db: Arc<DB>, contact: Contact) {
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(CACHE_DURATION)).await;

            // Get all cached delegation keys
            let iter = db.iterator_opt(
                rocksdb::IteratorMode::From(DELEGATIONS_KEY_PREFIX, rocksdb::Direction::Forward),
                rocksdb::ReadOptions::default(),
            );

            for item in iter {
                if let Ok((key, _)) = item {
                    if let Ok(key_str) = String::from_utf8(key.to_vec()) {
                        if key_str.starts_with(std::str::from_utf8(DELEGATIONS_KEY_PREFIX).unwrap())
                        {
                            // Extract the address part after the prefix
                            let prefix_len = DELEGATIONS_KEY_PREFIX.len();
                            let addr_str = key_str[prefix_len..].to_string();
                            if let Ok(delegator) = CosmosAddress::from_bech32(addr_str) {
                                info!("Refreshing delegations for {}", delegator);
                                if let Err(e) = fetch_delegations(&db, &contact, delegator).await {
                                    error!(
                                        "Failed to refresh delegations for {}: {}",
                                        delegator, e
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}
