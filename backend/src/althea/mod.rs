use crate::database::compact_db;
use crate::Opts;
use actix_web::rt::System;
use ambient::pools::InitPoolEvent;
use ambient::search_for_pools;
use clarity::Address;
use deep_space::Contact;
use log::{error, info};
use std::str::FromStr;
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use web30::client::Web3;

pub mod ambient;
pub mod database;
pub mod endpoints;
pub mod error;
pub mod token_mappings;

// const ALTHEA_GRPC_URL: &str = "http://chainripper-2.althea.net:9090";
// const ALTHEA_ETH_RPC_URL: &str = "http://chainripper-2.althea.net:8545";
const ALTHEA_GRPC_URL: &str = "http://localhost:9090";
const ALTHEA_ETH_RPC_URL: &str = "http://localhost:8545";
const ALTHEA_PREFIX: &str = "althea";
const TIMEOUT: Duration = Duration::from_secs(45);
/// The core Ambient DEX contract
const CROC_SWAP_CTR: &str = "0x7580bFE88Dd3d07947908FAE12d95872a260F2D8";
/// The Ambient query helper contract
const CROC_QUERY_CTR: &str = "0x7878ae4EAd0C3f4993173f2B40F84f4B89DD6995";
const DEFAULT_START_SEARCH_BLOCK: u128 = 0u128;
const DEFAULT_SEARCH_RANGE: u128 = 1000u128;
/// Tokens we care to index pools for - any user may create pools permissionlessly
/// but that does not mean we care to report their data to the frontend
const DEFAULT_TOKEN_ADDRESSES: &[&str] = &[
    "0x0412C7c846bb6b7DC462CF6B453f76D8440b2609",
    "0x30dA8589BFa1E509A319489E014d384b87815D89",
    "0x9676519d99E390A180Ab1445d5d857E3f6869065",
];
/// These are the poolIdx values used when creating pools in our scripts/tests.
/// Template creation requires governance permission (Ops role) but any user can create a
/// pool using these templates permissionlessly.
const DEFAULT_POOL_TEMPLATES: &[u64] = &[36000, 36001];

/// Returns a Contact struct for interacting with Gravity Bridge, pre-configured with the url
/// and prefix
pub fn get_althea_contact(timeout: Duration) -> Contact {
    Contact::new(ALTHEA_GRPC_URL, timeout, ALTHEA_PREFIX).unwrap()
}

pub fn get_althea_web3(timeout: Duration) -> Web3 {
    Web3::new(ALTHEA_ETH_RPC_URL, timeout)
}

pub fn start_ambient_indexer(opts: Opts, db: Arc<rocksdb::DB>) {
    let tokens = get_tokens(&opts);
    let templates = get_templates(&opts);

    thread::spawn(move || {
        let db = db.clone();
        let runner = System::new();

        runner.block_on(async move {
            loop {
                // Ignore the error for now, as it does not meaninfully affect the loop
                if let Err(e) = search_for_pools(&db).await {
                    error!("Error searching for pools: {}", e);
                }
                // search_for_positions(&db, &tokens, &templates).await;

                if opts.compact {
                    info!("Compacting database");
                    compact_db(&db);
                }

                if opts.halt_after_indexing {
                    info!("Halt after indexing set - halting");
                    std::process::exit(0);
                }

                thread::sleep(Duration::from_secs(10));
            }
        });
    });
}

fn get_tokens(opts: &Opts) -> Vec<Address> {
    if opts.pool_tokens.is_empty() {
        DEFAULT_TOKEN_ADDRESSES
            .iter()
            .map(|v| Address::from_str(v).unwrap())
            .collect::<Vec<_>>()
    } else {
        opts.pool_tokens.clone()
    }
}

fn get_templates(opts: &Opts) -> Vec<u64> {
    if opts.pool_templates.is_empty() {
        DEFAULT_POOL_TEMPLATES.to_vec()
    } else {
        opts.pool_templates.clone()
    }
}
