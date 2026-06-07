export interface IFilter
{
	containerEl: HTMLElement

	filterFill(): void
	onResize(): void
	updateData(): Promise<void>
	updateDisplay(): Promise<void>
}