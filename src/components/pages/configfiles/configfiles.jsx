/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
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
		} catch (e) { }

		return (
			<div className={styles.content}>
				<div className={styles['content-controls']}>
					<button type="button" onClick={() => ConfigFiles.handleCopyCode(code)}>
						<Icon className={styles['button-icon-copy']} type="copy" />
						{' '}
						Скопировать
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
					{' '}
					<i>config_files</i>
					{' '}
					объект не доступен;
					проверьте конфиг-файл и убедитесь, что директива
					{' '}
					<i>api_config_files</i>
					{' '}
					включена.
				</div>
			);
		}

		return (
			<div className={styles.container}>
				<h1>Конфиг-файлы</h1>
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
