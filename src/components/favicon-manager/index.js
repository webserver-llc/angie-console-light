import React from 'react';

const faviconHref = 'assets/images/Fav16.png';
const faviconDangerHref = 'assets/images/Fav16-danger.png';
const faviconWarningHref = 'assets/images/Fav16-warn.png';

export default class FaviconManager extends React.Component {
	static changeFavicon(faviconPath) {
		let link = document.querySelector("link[rel~='icon']");
		if (!link) {
			link = document.createElement('link');
			link.rel = 'icon';
			document.head.appendChild(link);
		}
		link.href = faviconPath;
	}

	constructor(props) {
		super(props);
		this.state = {
			odd: false,
			intervalID: 0,
		};
	}

	componentDidMount() {
		const intervalID = setInterval(() => {
			const { odd } = this.state;
			this.setState({ odd: !odd });
		}, 2000);
		this.setState({ intervalID });
	}

	componentWillUnmount() {
		const { intervalID } = this.state;
		clearInterval(intervalID);
	}

	getStatuses() {
		const { statuses } = this.props;

		if (statuses) {
			const values = Object.values(statuses);
			let item = values.some(({ status }) => status === 'danger');
			if (item) {
				return 'danger';
			}

			item = values.some(({ status }) => status === 'warning');
			if (item) {
				return 'warning';
			}

			return 'ok';
		}
	}

	render() {
		const { odd } = this.state;
		const status = this.getStatuses();

		if (!odd) {
			if (status === 'ok') {
				FaviconManager.changeFavicon(faviconHref);
			}

			if (status === 'danger') {
				FaviconManager.changeFavicon(faviconDangerHref);
			}

			if (status === 'warning') {
				FaviconManager.changeFavicon(faviconWarningHref);
			}
		} else {
			FaviconManager.changeFavicon(faviconHref);
		}

		return null;
	}
}
