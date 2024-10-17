use std::{cmp::min, str::FromStr, sync::Arc};

use clarity::Address;
use events::INIT_POOL_SIGNATURE;
use log::info;
use pools::InitPoolEvent;

use crate::althea::{
    database::{get_latest_searched_block, save_latest_searched_block, save_pool},
    get_althea_web3, CROC_SWAP_CTR, DEFAULT_SEARCH_RANGE, DEFAULT_START_SEARCH_BLOCK, TIMEOUT,
};

use super::error::AltheaError;

pub mod events;
pub mod pools;

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
