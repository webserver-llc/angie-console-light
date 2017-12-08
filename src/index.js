if(!!(window.Proxy && window.Promise)){
	require('./index.jsx');
} else {
	require('./unsupported.jsx');
}
