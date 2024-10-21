use clarity::Address;
use clarity::Uint256;
use log::debug;
use log::info;

use super::super::ambient::positions::{
    BurnAmbientEvent, BurnRangedEvent, MintAmbientEvent, MintRangedEvent,
};

pub const MINT_RANGED_PREFIX: &str = "mint-ranged_";
fn mint_ranged_key(
    user: Address,
    block: Uint256,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
    bid_tick: i32,
    ask_tick: i32,
) -> String {
    format!(
        "{}{}_{}_{}_{}_{}_{}_{}",
        MINT_RANGED_PREFIX, user, block, base, quote, pool_idx, bid_tick, ask_tick,
    )
}

// Gets a single MintRanged event from `db` by the other arguments, returns none if it does not exist
pub fn get_mint_ranged(
    db: &rocksdb::DB,
    user: Address,
    block: Uint256,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
    bid_tick: i32,
    ask_tick: i32,
) -> Option<MintRangedEvent> {
    let k = mint_ranged_key(user, block, base, quote, pool_idx, bid_tick, ask_tick);
    let v = db.get(k.as_bytes()).unwrap();
    #[allow(clippy::question_mark)]
    if v.is_none() {
        return None;
    }
    bincode::deserialize(&v.unwrap()).unwrap()
}

// Gets all known MintRanged events from the database
pub fn get_all_mint_ranged(db: &rocksdb::DB) -> Vec<MintRangedEvent> {
    let prefix = MINT_RANGED_PREFIX.as_bytes();
    let mut events = vec![];
    let iter = db.prefix_iterator(prefix);
    for entry in iter {
        match entry {
            Ok((k, v)) => {
                if !k.starts_with(prefix) {
                    break;
                }
                let pool: MintRangedEvent = bincode::deserialize(&v).unwrap();
                events.push(pool);
            }
            Err(_) => break,
        }
    }
    events
}

pub fn save_mint_ranged(db: &rocksdb::DB, mre: MintRangedEvent) {
    let k = mint_ranged_key(
        mre.user,
        mre.block_height,
        mre.base,
        mre.quote,
        mre.pool_idx,
        mre.bid_tick,
        mre.ask_tick,
    );
    debug!("Saving MintRangedEvent to key {}", k);
    let v = bincode::serialize(&mre).unwrap();

    db.put(k.as_bytes(), v).unwrap();
}

pub const MINT_AMBIENT_PREFIX: &str = "mint-ambient_";
fn mint_ambient_key(
    user: Address,
    block: Uint256,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
) -> String {
    format!(
        "{}{}_{}_{}_{}_{}",
        MINT_AMBIENT_PREFIX, user, block, base, quote, pool_idx,
    )
}

// Gets a single MintAmbient event from `db` by the other arguments, returns none if it does not exist
pub fn get_mint_ambient(
    db: &rocksdb::DB,
    user: Address,
    block: Uint256,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
) -> Option<MintAmbientEvent> {
    let k = mint_ambient_key(user, block, base, quote, pool_idx);
    let v = db.get(k.as_bytes()).unwrap();
    #[allow(clippy::question_mark)]
    if v.is_none() {
        return None;
    }
    bincode::deserialize(&v.unwrap()).unwrap()
}

// Gets all known MintAmbient events from the database
pub fn get_all_mint_ambient(db: &rocksdb::DB) -> Vec<MintAmbientEvent> {
    let prefix = MINT_AMBIENT_PREFIX.as_bytes();
    let mut events = vec![];
    let iter = db.prefix_iterator(prefix);
    for entry in iter {
        match entry {
            Ok((k, v)) => {
                if !k.starts_with(prefix) {
                    break;
                }
                let event: MintAmbientEvent = bincode::deserialize(&v).unwrap();
                events.push(event);
            }
            Err(_) => break,
        }
    }
    events
}

pub fn save_mint_ambient(db: &rocksdb::DB, mre: MintAmbientEvent) {
    let k = mint_ambient_key(
        mre.user,
        mre.block_height,
        mre.base,
        mre.quote,
        mre.pool_idx,
    );
    debug!("Saving MintAmbientEvent to key {}", k);
    let v = bincode::serialize(&mre).unwrap();

    db.put(k.as_bytes(), v).unwrap();
}

pub const BURN_RANGED_PREFIX: &str = "burn-ranged_";
fn burn_ranged_key(
    user: Address,
    block: Uint256,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
    bid_tick: i32,
    ask_tick: i32,
) -> String {
    format!(
        "{}{}_{}_{}_{}_{}_{}_{}",
        BURN_RANGED_PREFIX, user, block, base, quote, pool_idx, bid_tick, ask_tick,
    )
}

// Gets a single BurnRanged event from `db` by the other arguments, returns none if it does not exist
pub fn get_burn_ranged(
    db: &rocksdb::DB,
    user: Address,
    block: Uint256,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
    bid_tick: i32,
    ask_tick: i32,
) -> Option<BurnRangedEvent> {
    let k = burn_ranged_key(user, block, base, quote, pool_idx, bid_tick, ask_tick);
    let v = db.get(k.as_bytes()).unwrap();
    #[allow(clippy::question_mark)]
    if v.is_none() {
        return None;
    }
    bincode::deserialize(&v.unwrap()).unwrap()
}

// Gets all known BurnRanged events from the database
pub fn get_all_burn_ranged(db: &rocksdb::DB) -> Vec<BurnRangedEvent> {
    let prefix = BURN_RANGED_PREFIX.as_bytes();
    let mut events = vec![];
    let iter = db.prefix_iterator(prefix);
    for entry in iter {
        match entry {
            Ok((k, v)) => {
                if !k.starts_with(prefix) {
                    break;
                }
                let event: BurnRangedEvent = bincode::deserialize(&v).unwrap();
                events.push(event);
            }
            Err(_) => break,
        }
    }
    events
}

pub fn save_burn_ranged(db: &rocksdb::DB, mre: BurnRangedEvent) {
    let k = burn_ranged_key(
        mre.user,
        mre.block_height,
        mre.base,
        mre.quote,
        mre.pool_idx,
        mre.bid_tick,
        mre.ask_tick,
    );
    debug!("Saving BurnRangedEvent to key {}", k);
    let v = bincode::serialize(&mre).unwrap();

    db.put(k.as_bytes(), v).unwrap();
}
pub const BURN_AMBIENT_PREFIX: &str = "burn-ambient_";
fn burn_ambient_key(
    user: Address,
    block: Uint256,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
) -> String {
    format!(
        "{}{}_{}_{}_{}_{}",
        BURN_AMBIENT_PREFIX, user, block, base, quote, pool_idx,
    )
}

// Gets a single BurnAmbient event from `db` by the other arguments, returns none if it does not exist
pub fn get_burn_ambient(
    db: &rocksdb::DB,
    user: Address,
    block: Uint256,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
) -> Option<BurnAmbientEvent> {
    let k = burn_ambient_key(user, block, base, quote, pool_idx);
    let v = db.get(k.as_bytes()).unwrap();
    #[allow(clippy::question_mark)]
    if v.is_none() {
        return None;
    }
    bincode::deserialize(&v.unwrap()).unwrap()
}

// Gets all known BurnAmbient events from the database
pub fn get_all_burn_ambient(db: &rocksdb::DB) -> Vec<BurnAmbientEvent> {
    let prefix = BURN_AMBIENT_PREFIX.as_bytes();
    let mut events = vec![];
    let iter = db.prefix_iterator(prefix);
    for entry in iter {
        match entry {
            Ok((k, v)) => {
                if !k.starts_with(prefix) {
                    break;
                }
                let event: BurnAmbientEvent = bincode::deserialize(&v).unwrap();
                events.push(event);
            }
            Err(_) => break,
        }
    }
    events
}

pub fn save_burn_ambient(db: &rocksdb::DB, mre: BurnAmbientEvent) {
    let k = burn_ambient_key(
        mre.user,
        mre.block_height,
        mre.base,
        mre.quote,
        mre.pool_idx,
    );
    debug!("Saving BurnAmbientEvent to key {}", k);
    let v = bincode::serialize(&mre).unwrap();

    db.put(k.as_bytes(), v).unwrap();
}
