<template>
	<span :class="{ loading: !text }">{{ text }}<span /><span /><span /></span>
</template>

<script>
export default {
	props: {
		text: String,
	},
};
</script>

<style scoped>
span.loading > span {
	display: inline-block;
	background: #000;
	border-radius: 0.09375em;
	width: 0.1875em;
	height: 0.1875em;
	margin: 0.25em 0.075em;
	opacity: 0.5;
}
span.loading > span:nth-child(1) {
	animation: fade 1s ease 0s infinite;
}
span.loading > span:nth-child(2) {
	animation: fade 1s ease 0.333s infinite;
}
span.loading > span:nth-child(3) {
	animation: fade 1s ease 0.666s infinite;
}
@keyframes fade {
	0% {
		opacity: 1;
	}
	33.3% {
		opacity: 0.25;
	}
	66.6% {
		opacity: 0.25;
	}
	100% {
		opacity: 1;
	}
}
</style>
