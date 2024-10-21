use clarity::Address;
use clarity::Uint256;
use log::debug;
use log::info;

use crate::althea::ambient::croc_query::CurveState;

/// CrocQuery queryCurve()
pub const LATEST_CURVE_KEY: &str = "curve";
pub fn curve_key(base: Address, quote: Address, pool_idx: Uint256) -> String {
    format!("{}{}_{}_{}", LATEST_CURVE_KEY, base, quote, pool_idx)
}
pub fn get_curve(
    db: &rocksdb::DB,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
) -> Option<CurveState> {
    let k = curve_key(base, quote, pool_idx);
    let v = db.get(k.as_bytes()).unwrap();
    #[allow(clippy::question_mark)]
    if v.is_none() {
        debug!("No curve at key {}", k);
        return None;
    }
    let decoded: CurveState = bincode::deserialize(&v.unwrap()).unwrap();
    Some(decoded)
}
pub fn save_curve(
    db: &rocksdb::DB,
    curve: CurveState,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
) {
    debug!("Saving curve {:?}", curve);
    let k = curve_key(base, quote, pool_idx);
    let v = bincode::serialize(&curve).unwrap();
    db.put(k.as_bytes(), v).unwrap();
}

/// CrocQuery queryPrice()
pub const LATEST_PRICE_KEY: &str = "price";
pub fn price_key(base: Address, quote: Address, pool_idx: Uint256) -> String {
    format!("{}{}_{}_{}", LATEST_PRICE_KEY, base, quote, pool_idx)
}
pub fn get_price(
    db: &rocksdb::DB,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
) -> Option<u128> {
    let k = price_key(base, quote, pool_idx);
    let v = db.get(k.as_bytes()).unwrap();
    #[allow(clippy::question_mark)]
    if v.is_none() {
        debug!("No price at key {}", k);
        return None;
    }
    let v = v.unwrap();
    let decoded = u128::from_be_bytes(v.try_into().unwrap());
    Some(decoded)
}
pub fn save_price(db: &rocksdb::DB, price: u128, base: Address, quote: Address, pool_idx: Uint256) {
    debug!("Saving price {:?}", price);
    let k = price_key(base, quote, pool_idx);
    let v = price.to_be_bytes();
    db.put(k.as_bytes(), v).unwrap();
}

/// CrocQuery queryLiquidity()
pub const LATEST_LIQUIDITY_KEY: &str = "liquidity";
pub fn liquidity_key(base: Address, quote: Address, pool_idx: Uint256) -> String {
    format!("{}{}_{}_{}", LATEST_LIQUIDITY_KEY, base, quote, pool_idx)
}
pub fn get_liquidity(
    db: &rocksdb::DB,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
) -> Option<u128> {
    let k = liquidity_key(base, quote, pool_idx);
    let v = db.get(k.as_bytes()).unwrap();
    #[allow(clippy::question_mark)]
    if v.is_none() {
        debug!("No price at key {}", k);
        return None;
    }
    let v = v.unwrap();
    let decoded = u128::from_be_bytes(v.try_into().unwrap());
    Some(decoded)
}
pub fn save_liquidity(
    db: &rocksdb::DB,
    liquidity: u128,
    base: Address,
    quote: Address,
    pool_idx: Uint256,
) {
    debug!("Saving liquidity {:?}", liquidity);
    let k = liquidity_key(base, quote, pool_idx);
    let v = liquidity.to_be_bytes();
    db.put(k.as_bytes(), v).unwrap();
}
