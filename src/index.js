if (!!(window.Proxy && window.Promise)) {
	require('./index.jsx').start();
} else {
	require('./unsupported.jsx').start();
}
