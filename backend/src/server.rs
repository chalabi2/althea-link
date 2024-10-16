use std::sync::Arc;

use crate::althea::endpoints::{query_all_pools, query_pool};
use crate::tls::{load_certs, load_private_key};
use crate::Opts;
use actix_web::{middleware, web, App, HttpServer, Responder};
use log::info;
use rustls::ServerConfig;

async fn index() -> impl Responder {
    "althea.link"
}

pub async fn start_server(opts: Opts, db: Arc<rocksdb::DB>) {
    let db = web::Data::new(db.clone());
    let server = HttpServer::new(move || {
        App::new()
            .app_data(db.clone())
            .route("/", web::get().to(index))
            .service(
                web::scope("/debug")
                    .service(query_all_pools)
                    .service(query_pool),
            )
            .wrap(middleware::Compress::default())
    });

    if opts.https {
        let cert_file = opts
            .cert_file
            .expect("cert_file is required when https is enabled");
        let key_file = opts
            .key_file
            .expect("key_file is required when https is enabled");

        let cert_chain = load_certs(&cert_file);
        let keys = load_private_key(&key_file);
        let config = ServerConfig::builder()
            .with_safe_defaults()
            .with_no_client_auth()
            .with_single_cert(cert_chain, keys)
            .unwrap();

        info!("Server starting at https://{}:{}", opts.address, opts.port);
        server
            .bind_rustls(format!("{}:{}", opts.address, opts.port), config)
            .unwrap()
            .run()
            .await
            .unwrap();
    } else {
        info!("Server starting at http://{}:{}", opts.address, opts.port);
        server
            .bind(format!("{}:{}", opts.address, opts.port))
            .unwrap()
            .run()
            .await
            .unwrap();
    }
}
