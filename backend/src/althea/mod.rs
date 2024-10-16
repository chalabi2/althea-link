use crate::database::compact_db;
use crate::Opts;
use actix_web::rt::System;
use clarity::Address;
use database::{get_latest_searched_block, save_latest_searched_block, save_pool};
use deep_space::Contact;
use error::AltheaError;
use log::{error, info};
use pools::{InitPoolEvent, INIT_POOL_SIGNATURE};
use std::cmp::min;
use std::str::FromStr;
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use web30::client::Web3;

pub mod database;
pub mod endpoints;
pub mod error;
pub mod pools;
pub mod token_mappings;

// const ALTHEA_GRPC_URL: &str = "http://chainripper-2.althea.net:9090";
// const ALTHEA_ETH_RPC_URL: &str = "http://chainripper-2.althea.net:8545";
const ALTHEA_GRPC_URL: &str = "http://localhost:9090";
const ALTHEA_ETH_RPC_URL: &str = "http://localhost:8545";
const ALTHEA_PREFIX: &str = "althea";
const TIMEOUT: Duration = Duration::from_secs(45);
const CROC_SWAP_CTR: &str = "0x7580bFE88Dd3d07947908FAE12d95872a260F2D8";
const CROC_QUERY_CTR: &str = "0x7878ae4EAd0C3f4993173f2B40F84f4B89DD6995";
const DEFAULT_START_SEARCH_BLOCK: u128 = 0u128;
const DEFAULT_SEARCH_RANGE: u128 = 1000u128;
const DEFAULT_TOKEN_ADDRESSES: &[&str] = &[
    "0x0412C7c846bb6b7DC462CF6B453f76D8440b2609",
    "0x30dA8589BFa1E509A319489E014d384b87815D89",
    "0x9676519d99E390A180Ab1445d5d857E3f6869065",
];
const DEFAULT_POOL_TEMPLATES: &[u64] = &[36000, 36001];

const MINT_RANGED_SIGNATURE: &str =
    "MintRanged(address,address,address,uint256,uint128,int24,int24,uint128,uint128)";
const MINT_AMBIENT_SIGNATURE: &str =
    "MintAmbient(address,address,address,uint256,uint128,uint128,uint128)";

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

pub async fn search_for_pools(db: &Arc<rocksdb::DB>) -> Result<(), AltheaError> {
    info!("Search for pools");
    let web3 = get_althea_web3(TIMEOUT);
    let start_block = get_latest_searched_block(db).unwrap_or(DEFAULT_START_SEARCH_BLOCK.into());
    let current_block = web3.eth_block_number().await?;
    let end_block = min(start_block + DEFAULT_SEARCH_RANGE.into(), current_block);

    let ctr = Address::from_str(CROC_SWAP_CTR).unwrap();
    let topics = vec![INIT_POOL_SIGNATURE];
    info!("Searching on {ctr} for {topics:?} from block {start_block} to block {end_block}");
    let events = web3
        .check_for_events(start_block, Some(end_block), vec![ctr], topics)
        .await?;
    info!("Found {} events", events.len());
    save_latest_searched_block(db, end_block);
    let decoded_events = InitPoolEvent::from_logs(&events)?;
    info!("Decoded {} events", decoded_events.len());
    if decoded_events.is_empty() {
        return Ok(());
    }

    for event in decoded_events {
        info!("Writing {event:?} to database");
        save_pool(db, event);
    }

    Ok(())
}

pub async fn search_for_positions(_db: &Arc<rocksdb::DB>, _tokens: &[Address], _templates: &[u64]) {
    todo!()
}
