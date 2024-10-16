use std::fmt;

use web30::jsonrpc::error::Web3Error;

pub enum AltheaError {
    EthereumRestError(Web3Error),
    InvalidEventLogError(String),
}
impl fmt::Display for AltheaError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AltheaError::EthereumRestError(val) => write!(f, "Web3 error: {}", val),
            AltheaError::InvalidEventLogError(val) => write!(f, "Invalid ethereum logs: {}", val),
        }
    }
}
impl From<Web3Error> for AltheaError {
    fn from(error: Web3Error) -> Self {
        AltheaError::EthereumRestError(error)
    }
}
