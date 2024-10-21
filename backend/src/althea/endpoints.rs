use crate::althea::database::{
    pools::{get_init_pool, get_init_pools},
    positions::{
        get_all_burn_ambient, get_all_burn_ranged, get_all_mint_ambient, get_all_mint_ranged,
    },
};
use actix_web::{
    get, post,
    web::{self, Json},
    HttpResponse, Responder,
};
use clarity::{Address, Uint256};
use log::info;
use rocksdb::DB;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct PoolRequest {
    pub base: Address,
    pub quote: Address,
    pub pool_idx: Uint256,
}

/// Retrieves a pool by its base, quote, and pool index.
///
/// # Query
///
/// The request body should be a JSON object with the following fields:
///
/// - `base`: The address of the pool's base token
/// - `quote`: The address of the pool's quote token
/// - `poolIdx`: The pool's template value
///
/// # Response
///
/// The response body will be a JSON array of `PoolInitEvent` objects representing the moment of creation of the pool
#[post("/init_pool")]
pub async fn query_pool(req: Json<PoolRequest>, db: web::Data<Arc<DB>>) -> impl Responder {
    let req = req.into_inner();
    info!("Querying pool {:?}", req);
    let pool = get_init_pool(&db, req.base, req.quote, req.pool_idx);
    match pool {
        Some(pool) => HttpResponse::Ok().json(pool),
        None => HttpResponse::NotFound().body("No pool found for base quote poolIdx triple"),
    }
}

/// Retrieves all known InitPool events
///
/// # Query
///
/// A simple HTTP GET request
///
/// # Response
///
/// The response body will be a JSON array of `InitPoolEvent` objects representing the moment of creation of the pools
#[get("/init_pools")]
pub async fn query_all_init_pools(db: web::Data<Arc<DB>>) -> impl Responder {
    info!("Querying all InitPools");
    let pools = get_init_pools(&db);
    if pools.is_empty() {
        HttpResponse::NotFound().body("No pools found, try again later")
    } else {
        HttpResponse::Ok().json(pools)
    }
}

/// Retrieves all known MintRanged events
///
/// # Query
///
/// A simple HTTP GET request
///
/// # Response
///
/// The response body will be a JSON array of `MintRangedEvent` objects representing the moment of creation of the pools
#[get("/all_mint_ranged")]
pub async fn query_all_mint_ranged(db: web::Data<Arc<DB>>) -> impl Responder {
    info!("Querying all MintRanged events");
    let events = get_all_mint_ranged(&db);
    if events.is_empty() {
        HttpResponse::NotFound().body("No MintRangedEvents found, try again later")
    } else {
        HttpResponse::Ok().json(events)
    }
}

/// Retrieves all known MintAmbient events
///
/// # Query
///
/// A simple HTTP GET request
///
/// # Response
///
/// The response body will be a JSON array of `MintAmbientEvent` objects representing the moment of creation of the pools
#[get("/all_mint_ambient")]
pub async fn query_all_mint_ambient(db: web::Data<Arc<DB>>) -> impl Responder {
    info!("Querying all MintAmbinet events");
    let events = get_all_mint_ambient(&db);
    if events.is_empty() {
        HttpResponse::NotFound().body("No MintAmbientEvents found, try again later")
    } else {
        HttpResponse::Ok().json(events)
    }
}

/// Retrieves all known BurnRanged events
///
/// # Query
///
/// A simple HTTP GET request
///
/// # Response
///
/// The response body will be a JSON array of `BurnRangedEvent` objects representing the moment of creation of the pools
#[get("/all_burn_ranged")]
pub async fn query_all_burn_ranged(db: web::Data<Arc<DB>>) -> impl Responder {
    info!("Querying all BurnRanged events");
    let events = get_all_burn_ranged(&db);
    if events.is_empty() {
        HttpResponse::NotFound().body("No BurnRangedEvents found, try again later")
    } else {
        HttpResponse::Ok().json(events)
    }
}

/// Retrieves all known BurnAmbient events
///
/// # Query
///
/// A simple HTTP GET request
///
/// # Response
///
/// The response body will be a JSON array of `BurnAmbientEvent` objects representing the moment of creation of the pools
#[get("/all_burn_ambient")]
pub async fn query_all_burn_ambient(db: web::Data<Arc<DB>>) -> impl Responder {
    info!("Querying all MintAmbinet events");
    let events = get_all_burn_ambient(&db);
    if events.is_empty() {
        HttpResponse::NotFound().body("No BurnAmbientEvents found, try again later")
    } else {
        HttpResponse::Ok().json(events)
    }
}
