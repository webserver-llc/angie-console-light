if (!!(window.Proxy && window.Promise && window.Worker)) {
	require('./index.jsx').start();
} else {
	require('./unsupported.jsx').start();
}
