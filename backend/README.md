# Althea.link backend

This repo serves as the Althea.link backend server via the below APIs. We serve two distinct APIs from this backend, detailed below

## DEBUG API

The debug api is used to inspect state during development

`/debug/pool/` - a POST endpoint expecting the base, quote, and poolIdx triple via JSON and returning the associated pool
`/debug/pools/`- a GET endpoint that returns all discovered pools

## gcgo API

The gcgo API is meant to fulfil the needs of the frontend, and is based off of the graphcache-go repo made for Ambient.

`/gcgo/...` - TODO