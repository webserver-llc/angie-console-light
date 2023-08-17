export const getServerName = (peer) => {
	if (!peer) { throw new Error('Peer is required argument and should be an object'); }

	if (
		!('server' in peer) ||
		!peer.server ||
    (typeof peer.server === 'string' && peer.server.length === 0)
	) {
		throw new Error('Server is required in peer');
	}

	if ('service' in peer) {
		if (typeof peer.service === 'string' && peer.service.length !== 0) {
			return `${peer.service}@${peer.server}`;
		}
	}

	return peer.server;
};

export default {
	getServerName,
};
