//! Database creation and overall management goes here, database functions more specific to chains go into each chain modules database.rs module

use crate::Opts;
use log::info;
use rocksdb::Options;
use rocksdb::DB;
use std::time::Instant;

/// Creates a new RocksDB database in the current directory
pub fn open_database(opts: Opts) -> DB {
    let mut db_options = Options::default();
    let num_cpus = num_cpus::get() as i32;
    db_options.increase_parallelism(num_cpus);
    db_options.set_max_open_files(num_cpus);
    db_options.set_max_background_jobs(num_cpus / 2);
    db_options.set_max_subcompactions(16);
    db_options.create_if_missing(true);
    let db = DB::open(&db_options, opts.database_path).expect("Failed to open database");
    if opts.compact {
        compact_db(&db);
    } else if opts.compact_and_halt {
        compact_db(&db);
        info!("Database compaction complete, halting");
        std::process::exit(0);
    }
    db
}

/// manually requests DB compaction this optimizes database performance and may for
/// some reason end up not happening often enough.
pub fn compact_db(db: &DB) {
    let start = Instant::now();
    info!("Starting DB compaction");
    let typed_none: Option<[u8; 1]> = None;
    db.compact_range(typed_none, typed_none);
    info!("DB compaction took: {:?}", start.elapsed());
}
