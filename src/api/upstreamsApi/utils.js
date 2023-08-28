import { isIP } from '../../utils';

const defaultPort = 80;

export const getServerName = (peer) => {
	if (!peer) {
		throw new Error('Peer is required argument and should be an object');
	}

	if (
		!('server' in peer) ||
		!peer.server ||
		(typeof peer.server === 'string' && peer.server.length === 0)
	) {
		throw new Error('Server is required in peer');
	}

	// add default port, if isn't set
	// should fix next version Angie Pro
	function getServer(server) {
		if (isIP(server) && server.indexOf(':') === -1) return `${server}:${defaultPort}`;
		return server;
	}

	if ('service' in peer) {
		if (typeof peer.service === 'string' && peer.service.length !== 0) {
			return `${peer.service}@${getServer(peer.server)}`;
		}
	}

	return getServer(peer.server);
};

export default {
	getServerName,
};
