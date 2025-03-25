import Tooltip from "$lib/tooltip.svelte"

export function tooltip(element, params) {
	if (params === undefined) {
		console.error('Tooltip: missing parameters');
		return;
	}
	//
	let tooltipComponent;
	function mouseOver(event) {
		tooltipComponent = new Tooltip({
			props: {
				data: params,
				x: event.pageX,
				y: event.pageY,
			},
			target: document.body,
		});
	}
	function mouseMove(event) {
		tooltipComponent.$set({
			x: event.pageX,
			y: event.pageY// - tooltipComponent.clientHeight,
		})
	}
	function mouseLeave() {
		if (tooltipComponent) tooltipComponent.$destroy();
	}
	
	element.addEventListener('mouseover', mouseOver);
	element.addEventListener('mouseleave', mouseLeave);
	element.addEventListener('mousemove', mouseMove);
	
	return {
		destroy() {
			element.removeEventListener('mouseover', mouseOver);
			element.removeEventListener('mouseleave', mouseLeave);
			element.removeEventListener('mousemove', mouseMove);
		}
	}
}