function formData(initialData = {}) {
	const data = initialData;

	Object.defineProperty(data, 'toJSON', {
		value() {
			Object.keys(this).forEach((key) => {
				if (!this[key]) return;
				if (
					key === 'weight' ||
          key === 'max_conns' ||
          key === 'max_fails' ||
          key === 'fail_timeout'
				) {
					this[key] = parseInt(this[key], 10);
				}
			});
			const { toJSON, server, ...props } = this;
			return props;
		},
	});

	return data;
}

export default formData;
