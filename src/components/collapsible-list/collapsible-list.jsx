import Collapsible from 'react-collapsible';
import React from 'react';
import styles from './styles.css';

export default class CollapsibleList extends React.Component {
	render() {
		return (
			<Collapsible
				triggerClassName={styles.triggerClose}
				triggerOpenedClassName={styles.triggerOpen}
			  {...this.props}
			/>
		);
	}
}
