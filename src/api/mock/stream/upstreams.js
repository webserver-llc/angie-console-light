function randomIntFromInterval(min, max) { // min and max included
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function currentConnection() {
	return randomIntFromInterval(1, 50);
}

// eslint-disable-next-line no-unused-vars
export default (params) => ({
	news: {
		peers: {
			'10.19.127.1:80': {
				server: '10.19.127.1',
				backup: false,
				weight: 1,
				state: 'up',
				selected: {
					current: currentConnection(),
					total: 190038,
					last: '2023-09-15T08:02:46Z'
				},
				max_conns: 10,
				data: {
					sent: 14674032,
					received: 6196272938
				},
				health: {
					fails: 678,
					unavailable: 0,
					downtime: 12218,
				}
			},
			'10.19.127.2:80': {
				server: '10.19.127.2',
				backup: false,
				weight: 1,
				state: 'up',
				selected: {
					current: currentConnection(),
					total: 190069,
					last: '2023-09-15T08:02:46Z'
				},
				max_conns: 10,
				data: {
					sent: 14675937,
					received: 6199649092
				},
				health: {
					fails: 657,
					unavailable: 0,
					downtime: 10982,
				}
			}
		},
		keepalive: 0,
		zombies: 0,
		zone: 'http-upstream-black'
	},
	music: {
		peers: {
			'10.19.127.4:80': {
				server: 'dark.blue.app',
				backup: false,
				weight: 1,
				state: 'up',
				selected: {
					current: currentConnection(),
					total: 189927,
					last: '2023-09-15T08:02:46Z'
				},
				max_conns: 10,
				data: {
					sent: 14664142,
					received: 6200252301
				},
				health: {
					fails: 695,
					unavailable: 0,
					downtime: 12287,
				}
			},
			'10.19.127.3:80': {
				server: 'light.blue.app',
				backup: false,
				weight: 1,
				state: 'up',
				selected: {
					current: currentConnection(),
					total: 189939,
					last: '2023-09-15T08:02:46Z'
				},
				max_conns: 10,
				data: {
					sent: 14664749,
					received: 6180178112
				},
				health: {
					fails: 690,
					unavailable: 0,
					downtime: 11263,
				}
			},
			'10.19.127.5:80': {
				server: 'backup.blue.app',
				backup: true,
				weight: 1,
				state: 'up',
				selected: {
					current: currentConnection(),
					total: 8,
					last: '2023-09-15T02:01:19Z'
				},
				max_conns: 10,
				data: {
					sent: 613,
					received: 311972
				},
				health: {
					fails: 0,
					unavailable: 0,
					downtime: 10678,
				}
			}
		},
		keepalive: 0,
		zombies: 0,
		zone: 'http-upstream-blue'
	}
});
