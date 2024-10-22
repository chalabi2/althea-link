use clarity::Address;
use clarity::Uint256;
use log::debug;

use super::InitPoolEvent;

pub const INIT_POOL_PREFIX: &str = "init-pool_";
fn init_pool_key(base: Address, quote: Address, pool_idx: Uint256) -> String {
    format!("{}{}_{}_{}", INIT_POOL_PREFIX, base, quote, pool_idx,)
}

// Gets all known InitPool events from the database
// Note: these are the pools as of the InitPool event, not the current state
pub fn get_init_pools(db: &rocksdb::DB) -> Vec<InitPoolEvent> {
    let prefix = INIT_POOL_PREFIX.as_bytes();
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

// Gets a single InitPool event from the database by its (base, quote, pool index) triple, returns none if it does not exist
// Note: this is the pool as of the InitPool event, not the current state
pub fn get_init_pool(
    db: &rocksdb::DB,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
) -> Option<InitPoolEvent> {
    let v = db
        .get(init_pool_key(base, quote, pool_idx).as_bytes())
        .unwrap();
    #[allow(clippy::question_mark)]
    if v.is_none() {
        return None;
    }
    bincode::deserialize(&v.unwrap()).unwrap()
}

pub fn save_init_pool(db: &rocksdb::DB, pool: InitPoolEvent) {
    let k = init_pool_key(pool.base, pool.quote, pool.pool_idx);
    debug!("Saving pool to key {}", k);
    let v = bincode::serialize(&pool).unwrap();

    db.put(k.as_bytes(), v).unwrap();
}
