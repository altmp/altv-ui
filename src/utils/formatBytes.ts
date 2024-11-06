export function formatBytes(bytes: number): string {
	if (bytes === 0) {
		return "0 Bytes";
	} else if (bytes === 1) {
		return "1 Byte";
	}

	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));

	if (i === 0) {
		return bytes + " Bytes";
	} else {
		return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
	}
}
