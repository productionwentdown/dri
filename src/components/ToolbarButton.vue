<template>
	<button :class="{ danger }" @click="$emit('click', $event)">
		<slot />
	</button>
</template>

<script>
export default {
	props: {
		danger: Boolean,
	},
};
</script>

<style scoped>
button {
	appearance: none;
	border: none;
	outline: none;
	border-radius: 0.5rem;
	background: #66f;
	padding: 0.5rem 0.75rem;
	color: #fff;
	tap-highlight-color: transparent;
}
button:hover {
	background: #44f;
}
button:active {
	background: #00f;
}
button:focus {
	box-shadow: 0 0 0 0.25rem #ccf;
}
button.danger {
	background: #f66;
}
button.danger:hover {
	background: #f44;
}
button.danger:active {
	background: #f00;
}
button.danger:focus {
	box-shadow: 0 0 0 0.25rem #fcc;
}
</style>
