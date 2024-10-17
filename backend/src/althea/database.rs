use clarity::Address;
use clarity::Uint256;
use log::info;

use super::InitPoolEvent;

/// Followed by block number, the key is the prefix of the gravity block
pub const LATEST_SEARCHED_BLOCK_KEY: &str = "block";
pub const POOL_PREFIX: &str = "pool_";
pub const POSITION_PREFIX: &str = "position_";

pub fn get_latest_searched_block(db: &rocksdb::DB) -> Option<Uint256> {
    let v = db.get(LATEST_SEARCHED_BLOCK_KEY.as_bytes()).unwrap();
    #[allow(clippy::question_mark)]
    if v.is_none() {
        info!("No latest searched block");
        return None;
    }
    Some(Uint256::from_be_bytes(&v.unwrap()))
}
pub fn save_latest_searched_block(db: &rocksdb::DB, block: Uint256) {
    info!("Saving latest searched block {}", block);
    let value = block.to_be_bytes();
    db.put(LATEST_SEARCHED_BLOCK_KEY.as_bytes(), value).unwrap();
}

fn pool_key(base: Address, quote: Address, pool_idx: Uint256) -> String {
    format!("{}{}_{}_{}", POOL_PREFIX, base, quote, pool_idx,)
}

// Gets all known pools from the database
// Note: these are the pools as of the InitPool event, not the current state
pub fn get_pools(db: &rocksdb::DB) -> Vec<InitPoolEvent> {
    let prefix = POOL_PREFIX.as_bytes();
    let mut pools = vec![];
    let iter = db.prefix_iterator(prefix);
    for entry in iter {
        match entry {
            Ok((k, v)) => {
                if !k.starts_with(prefix) {
                    break;
                }
                let pool: InitPoolEvent = bincode::deserialize(&v).unwrap();
                pools.push(pool);
            }
            Err(_) => break,
        }
    }
    pools
}

// Gets a single pool from the database by its (base, quote, pool index) triple, returns none if it does not exist
// Note: this is the pool as of the InitPool event, not the current state
pub fn get_pool(
    db: &rocksdb::DB,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
) -> Option<InitPoolEvent> {
    let v = db.get(pool_key(base, quote, pool_idx).as_bytes()).unwrap();
    #[allow(clippy::question_mark)]
    if v.is_none() {
        return None;
    }
    bincode::deserialize(&v.unwrap()).unwrap()
}
pub fn save_pool(db: &rocksdb::DB, pool: InitPoolEvent) {
    let k = pool_key(pool.base, pool.quote, pool.pool_idx);
    info!("Saving pool to key {}", k);
    let v = bincode::serialize(&pool).unwrap();

    db.put(k.as_bytes(), v).unwrap();
}
