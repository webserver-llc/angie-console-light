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
import 'monaco-editor/esm/vs/editor/browser/coreCommands.js';
// import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController.js';
// import 'monaco-editor/esm/vs/basic-languages/ini/ini.contribution.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
// import * as monaco from 'monaco-editor';
import styles from './style.css';
import { tokenProvider as mimeTypeTokenProvider } from './syntax-definitions/mime-types';
import { tokenProvider as angieTokenProvider } from './syntax-definitions/angie';

self.MonacoEnvironment = {
	getWorkerUrl() {
		return './editor.worker.bundle.js';
	}
};

monaco.languages.register({ id: 'angie' });
monaco.languages.setMonarchTokensProvider('angie', angieTokenProvider);

monaco.languages.register({ id: 'mime-types' });
monaco.languages.setMonarchTokensProvider('mime-types', mimeTypeTokenProvider);

const EXTENSIONS = {
	conf: 'angie',
	types: 'mime-types',
};

export default class Editor extends React.Component {
	constructor(props) {
		super(props);
		this.divEl = React.createRef();
		this.editor = null;
		this.updateHeight = this.updateHeight.bind(this);
	}

	componentDidMount() {
		const { props: { code, extension } } = this;
		this.editor = monaco.editor.create(this.divEl.current, {
			value: code,
			language: EXTENSIONS[extension],
			automaticLayout: true,
			theme: 'vs-dark',
			readOnly: true,
			scrollBeyondLastLine: false,
			wordWrap: 'on',
			wrappingStrategy: 'advanced',
			scrollbar: {
				alwaysConsumeMouseWheel: false,
				scrollByPage: false,
				handleMouseWheel: false,
			},
			minimap: {
				enabled: false
			},
			overviewRulerLanes: 0
		});
		this.updateHeight();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.code !== this.props.code) {
			if (prevProps.extension !== this.props.extension) {
				this.editor.dispose();
				this.editor = monaco.editor.create(this.divEl.current, {
					value: this.props.code,
					language: EXTENSIONS[this.props.extension],
					automaticLayout: true,
					theme: 'vs-dark',
					readOnly: true,
					minimap: {
						enabled: false
					},
				});
			} else {
				this.editor.setValue(this.props.code);
			}
			this.updateHeight();
		}
	}

	componentWillUnmount() {
		this.editor.dispose();
	}

	updateHeight() {
		const { width } = this.divEl.current.getBoundingClientRect();
		const contentHeight = this.editor.getContentHeight();
		this.divEl.current.style.height = `${contentHeight}px`;
		this.editor.layout({ width, height: contentHeight });
	}

	render() {
		return <div className={styles.Editor} ref={this.divEl} />;
	}
}

Editor.defaultProps = {
	extension: 'conf',
};
