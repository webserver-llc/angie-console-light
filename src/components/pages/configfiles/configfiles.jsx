import React from 'react';
import Clipboard from 'clipboard';
import DataBinder from '../../databinder/databinder.jsx';
import Editor from '../../editor/editor.jsx';
import api from '#/api';
import Icon from '../../icon/icon.jsx';
import styles from './styles.css';
import CollapsibleList from '../../collapsible-list/collapsible-list.jsx';

export class ConfigFiles extends React.Component {
	constructor(props) {
		super(props);
		this.renderEditor = this.renderEditor.bind(this);
	}

	static handleCopyCode(code) {
		Clipboard.copy(code);
	}

	renderEditor(file) {
		const { props: { data: { angie } } } = this;
		const code = angie.config_files[file];

		let extension = '';
		try {
			[, extension] = file.match(/.(\w+)$/);
		} catch (e) {}

		return (
			<div className={styles.content}>
				<div className={styles['content-controls']}>
					<button type="button" onClick={() => ConfigFiles.handleCopyCode(code)}>
						<Icon className={styles['button-icon-copy']} type="copy" />
						{' '}
						Copy
					</button>
				</div>
				<Editor code={code} extension={extension} />
			</div>
		);
	}

	render() {
		const { props: { data: { angie } } } = this;

		if (!angie.config_files) {
			return (
				<div>
					The
					{' '}
					<i>config_files</i>
					{' '}
					object is unavailable;
					check your configuration and ensure the
					{' '}
					<i>api_config_files</i>
					{' '}
					directive is enabled.
				</div>
			);
		}

		return (
			<div className={styles.container}>
				<h1>Config Files</h1>
				{Object.keys(angie.config_files)
					.map(file => (
						<CollapsibleList
							overflowWhenOpen="visible"
							trigger={file}
							transitionTime={10}
						>
							{this.renderEditor(file)}
						</CollapsibleList>
					))}
			</div>
		);
	}
}

export default DataBinder(ConfigFiles, [
	api.angie,
]);
