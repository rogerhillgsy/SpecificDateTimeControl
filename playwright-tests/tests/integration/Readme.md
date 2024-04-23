# Integration Tests

This folders contains tests that interact with a live CRM system.
This needs to be configured through a .env file in the parent folder (copy the .env.template file and fill out accordingly.) 

## api-test.ts

Tests that use the saved browser state to authenticate with the CRM API.

Demonstrates a very simple "WhoAmI" call. Potentially this could be used to set up state before tests.

## interactions.test.ts

This uses a direct (non-fixture) approach to test a CRM model driven app.