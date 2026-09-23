// Select the test environment before application modules load configuration.
process.env.NODE_ENV = "test";
// Supply a deterministic secret when the test environment does not define one.
process.env.JWT_PRIVATE_KEY ||= "test-only-secret";
