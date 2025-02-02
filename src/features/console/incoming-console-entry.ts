export function nthIndexOf(str: string, substr: string, n: number): number {
	let i = -1;

	while (n > 0) {
		i = str.indexOf(substr, i + 1);
		if (i === -1) return -1;
		n--;
	}

	return i;
}

const ESCAPED_HTML_CHARACTERS = Object.freeze({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
});

export function escapeHtml(content: string): string {
	return content.replace(
		/[&<>"']/g,
		(match) =>
			ESCAPED_HTML_CHARACTERS[match as keyof typeof ESCAPED_HTML_CHARACTERS],
	);
}

export function transformUrlsToHtmlAnchors(string: string): string {
	return string.replace(
		/https?:\/\/[^\s/$.?#].[^\s]*/g,
		(url) => `<a href="${url}" target="_blank">${url}</a>`,
	);
}

export function getNewlinesCount(str: string): number {
	return (str.match(/\n/g) || []).length;
}

export interface IncomingConsoleEntrySettings {
	maxFormattedMessageLength: number;
	maxFormattedMessageNewlines: number;
	defaultColorIndex: number;
	colorByIndex: readonly string[];
	truncationSuffix: (count: number) => string;
}

export class IncomingConsoleEntry {
	/**
	 * Original message buffer without any processing.
	 */
	public originalMessage: string;
	/**
	 * Formatted, truncated, and escaped version of the original message buffer.
	 * Intended for display in the console interface.
	 */
	public formattedMessage: string;
	/**
	 * The total number of newline characters (`\n`) in the formatted message buffer.
	 */
	public formattedMessageNewlines: number;

	public readonly maxFormattedMessageLength: number;
	public readonly maxFormattedMessageNewlines: number;
	public readonly defaultColorIndex: number;
	public readonly colorByIndex: readonly string[];
	public readonly truncateMessage: (count: number) => string;

	private constructor(
		originalMessage: string,
		formattedMessage: string,
		formattedMessageNewlines: number,
		settings: IncomingConsoleEntrySettings,
	) {
		this.originalMessage = originalMessage;
		this.formattedMessage = formattedMessage;
		this.formattedMessageNewlines = formattedMessageNewlines;

		this.maxFormattedMessageLength = settings.maxFormattedMessageLength;
		this.maxFormattedMessageNewlines = settings.maxFormattedMessageNewlines;
		this.defaultColorIndex = settings.defaultColorIndex;
		this.colorByIndex = settings.colorByIndex;
		this.truncateMessage = settings.truncationSuffix;
	}

	static create(settings: IncomingConsoleEntrySettings): IncomingConsoleEntry {
		return new IncomingConsoleEntry("", "", 0, settings);
	}

	private getFormattedMessageFragment(
		colorIndex: number,
		messageFragment: string,
	): {
		content: string;
		newlines: number;
	} | null {
		if (
			this.formattedMessage.length > this.maxFormattedMessageLength ||
			this.formattedMessageNewlines > this.maxFormattedMessageNewlines
		)
			return null;

		let formattedFragment = escapeHtml(messageFragment);
		if (
			this.formattedMessage.length + formattedFragment.length >
			this.maxFormattedMessageLength
		) {
			const availableCharactersCount =
				this.maxFormattedMessageLength - this.formattedMessage.length;
			formattedFragment = formattedFragment.slice(0, availableCharactersCount);
		}

		const fragmentNewlineCount = getNewlinesCount(formattedFragment);
		if (
			this.formattedMessageNewlines + fragmentNewlineCount >
			this.maxFormattedMessageNewlines
		) {
			const availableNewlinesCount =
				this.maxFormattedMessageNewlines - this.formattedMessageNewlines;
			const lastNewlineIndex = nthIndexOf(
				formattedFragment,
				"\n",
				availableNewlinesCount,
			);
			formattedFragment = formattedFragment.slice(0, lastNewlineIndex);
		}

		if (
			colorIndex !== this.defaultColorIndex &&
			colorIndex >= 0 &&
			colorIndex < this.colorByIndex.length
		) {
			const color =
				this.colorByIndex[colorIndex] ??
				this.colorByIndex[this.defaultColorIndex]!;
			formattedFragment = `<span style="color:${color}">${formattedFragment}</span>`;
		}

		return {
			content: formattedFragment,
			newlines: fragmentNewlineCount,
		};
	}

	push(messageFragment: string, colorIndex: number) {
		this.originalMessage += messageFragment;

		const formattedFragment = this.getFormattedMessageFragment(
			colorIndex,
			messageFragment,
		);
		if (formattedFragment === null) return;

		this.formattedMessage += formattedFragment.content;
		this.formattedMessageNewlines += formattedFragment.newlines;
	}

	end() {
		this.formattedMessage = transformUrlsToHtmlAnchors(this.formattedMessage);

		if (this.originalMessage.length > this.formattedMessage.length) {
			const truncatedCharactersCount =
				this.originalMessage.length - this.formattedMessage.length;
			this.formattedMessage += this.truncateMessage(truncatedCharactersCount);
		}

		return {
			originalMessage: this.originalMessage,
			formattedMessage: this.formattedMessage,
		};
	}
}
