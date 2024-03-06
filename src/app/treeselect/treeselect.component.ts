import { AnimationEvent } from '@angular/animations';
import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ElementRef, EventEmitter, forwardRef, Input, NgModule, Output, QueryList, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayService, PrimeNGConfig, PrimeTemplate, TreeNode } from 'primeng/api';
import { DomHandler } from 'primeng/dom';

;
// import { Overlay } from 'primeng/overlay';
import { Tree } from 'primeng/tree';
import { ObjectUtils } from 'primeng/utils';
import { TreeSelectNodeCollapseEvent, TreeSelectNodeExpandEvent } from './treeselect.interface';

import { OverlayOptions } from '../overlay/overlayoptions';
import { Nullable } from '../models/ts-helpers';
import { Overlay } from '../overlay/overlay';

export const TREESELECT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TreeSelect),
    multi: true
};
/**
 * TreeSelect is a form component to choose from hierarchical data.
 * @group Components
 */
@Component({
    selector: 'p-treeSelect',
    templateUrl: './treeselect.component.html',
    styleUrls: ['./treeselect.component.css'],
    host: {
        class: 'p-element p-inputwrapper',
        '[class.p-inputwrapper-filled]': '!emptyValue',
        '[class.p-inputwrapper-focus]': 'focused || overlayVisible',
        '[class.p-treeselect-clearable]': 'showClear && !disabled'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TREESELECT_VALUE_ACCESSOR],
    encapsulation: ViewEncapsulation.None
})
export class TreeSelect implements AfterContentInit, ControlValueAccessor {
    /**
     * Identifier of the underlying input element.
     * @group Props
     */
    @Input() inputId: string | undefined;
    /**
     * Height of the viewport, a scrollbar is defined if height of list exceeds this value.
     * @group Props
     */
    @Input() scrollHeight: string = '400px';
    /**
     * When present, it specifies that the component should be disabled.
     * @group Props
     */
    @Input() disabled: boolean | undefined;
    /**
     * Defines how multiple items can be selected, when true metaKey needs to be pressed to select or unselect an item and when set to false selection of each item can be toggled individually. On touch enabled devices, metaKeySelection is turned off automatically.
     * @group Props
     */
    @Input() metaKeySelection: boolean = true;
    /**
     * Defines how the selected items are displayed.
     * @group Props
     */
    @Input() display: 'comma' | 'chip' = 'comma';
    /**
     * Defines the selection mode.
     * @group Props
     */
    @Input() selectionMode: 'single' | 'multiple' | 'checkbox' = 'single';
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    @Input() tabindex: string | undefined;
    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @group Props
     */
    @Input() ariaLabelledBy: string | undefined;
    /**
     * Label to display when there are no selections.
     * @group Props
     */
    @Input() placeholder: string | undefined;
    /**
     * Style class of the overlay panel.
     * @group Props
     */
    @Input() panelClass: string | string[] | Set<string> | { [klass: string]: any } | undefined;
    /**
     * Inline style of the panel element.
     * @group Props
     */
    @Input() panelStyle: { [klass: string]: any } | null | undefined;
    /**
     * Style class of the panel element.
     * @group Props
     */
    @Input() panelStyleClass: string | undefined;
    /**
     * Inline style of the container element.
     * @group Props
     */
    @Input() containerStyle: { [klass: string]: any } | null | undefined;
    /**
     * Style class of the container element.
     * @group Props
     */
    @Input() containerStyleClass: string | undefined;
    /**
     * Inline style of the label element.
     * @group Props
     */
    @Input() labelStyle: { [klass: string]: any } | null | undefined;
    /**
     * Style class of the label element.
     * @group Props
     */
    @Input() labelStyleClass: string | undefined;
    /**
     * Specifies the options for the overlay.
     * @group Props
     */
    @Input() overlayOptions: OverlayOptions | undefined;
    /**
     * Text to display when there are no options available. Defaults to value from PrimeNG locale configuration.
     * @group Props
     */
    @Input() emptyMessage: string = '';
    /**
     * A valid query selector or an HTMLElement to specify where the overlay gets attached. Special keywords are "body" for document body and "self" for the element itself.
     * @group Props
     */
    @Input() appendTo: HTMLElement | ElementRef | TemplateRef<any> | string | null | undefined | any;
    /**
     * When specified, displays an input field to filter the items.
     * @group Props
     */
    @Input() filter: boolean = false;
    /**
     * When filtering is enabled, filterBy decides which field or fields (comma separated) to search against.
     * @group Props
     */
    @Input() filterBy: string = 'label';
    /**
     * Mode for filtering valid values are "lenient" and "strict". Default is lenient.
     * @group Props
     */
    @Input() filterMode: string = 'lenient';
    /**
     * Placeholder text to show when filter input is empty.
     * @group Props
     */
    @Input() filterPlaceholder: string | undefined;
    /**
     * Locale to use in filtering. The default locale is the host environment's current locale.
     * @group Props
     */
    @Input() filterLocale: string | undefined;
    /**
     * Determines whether the filter input should be automatically focused when the component is rendered.
     * @group Props
     */
    @Input() filterInputAutoFocus: boolean = true;
    /**
     * Whether checkbox selections propagate to descendant nodes.
     * @group Props
     */
    @Input() propagateSelectionDown: boolean = true;
    /**
     * Whether checkbox selections propagate to ancestor nodes.
     * @group Props
     */
    @Input() propagateSelectionUp: boolean = true;
    /**
     * When enabled, a clear icon is displayed to clear the value.
     * @group Props
     */
    @Input() showClear: boolean = false;
    /**
     * Clears the filter value when hiding the dropdown.
     * @group Props
     */
    @Input() resetFilterOnHide: boolean = true;
    /**
     * An array of treenodes.
     * @defaultValue undefined
     * @group Props
     */
    @Input() get options(): TreeNode[] | undefined {
        return this._options;
    }
    set options(options: TreeNode[] | undefined) {
        this._options = options;
        this.updateTreeState();
    }
    /**
     * Transition options of the show animation.
     * @group Props
     * @deprecated since v14.2.0 use overlayOptions property instead.
     */
    @Input() get showTransitionOptions(): string | undefined {
        return this._showTransitionOptions;
    }
    set showTransitionOptions(val: string | undefined) {
        this._showTransitionOptions = val;
        console.warn('The showTransitionOptions property is deprecated since v14.2.0, use overlayOptions property instead.');
    }
    /**
     * Transition options of the hide animation.
     * @group Props
     * @deprecated since v14.2.0 use overlayOptions property instead.
     */
    @Input() get hideTransitionOptions(): string | undefined {
        return this._hideTransitionOptions;
    }
    set hideTransitionOptions(val: string | undefined) {
        this._hideTransitionOptions = val;
        console.warn('The hideTransitionOptions property is deprecated since v14.2.0, use overlayOptions property instead.');
    }
    /**
     * Callback to invoke when a node is expanded.
     * @param {TreeSelectNodeExpandEvent} event - Custom node expand event.
     * @group Emits
     */
    @Output() onNodeExpand: EventEmitter<TreeSelectNodeExpandEvent> = new EventEmitter<TreeSelectNodeExpandEvent>();
    /**
     * Callback to invoke when a node is collapsed.
     * @param {TreeSelectNodeCollapseEvent} event - Custom node collapse event.
     * @group Emits
     */
    @Output() onNodeCollapse: EventEmitter<TreeSelectNodeCollapseEvent> = new EventEmitter<TreeSelectNodeCollapseEvent>();
    /**
     * Callback to invoke when the overlay is shown.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    @Output() onShow: EventEmitter<Event> = new EventEmitter<Event>();
    /**
     * Callback to invoke when the overlay is hidden.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    @Output() onHide: EventEmitter<Event> = new EventEmitter<Event>();
    /**
     * Callback to invoke when input field is cleared.
     * @group Emits
     */
    @Output() onClear: EventEmitter<any> = new EventEmitter<any>();
    /**
     * Callback to invoke when data is filtered.
     * @group Emits
     */
    @Output() onFilter: EventEmitter<any> = new EventEmitter<any>();
    /**
     * Callback to invoke when a node is unselected.
     * @param {TreeNode} node - Node instance.
     * @group Emits
     */
    @Output() onNodeUnselect: EventEmitter<TreeNode> = new EventEmitter<TreeNode>();
    /**
     * Callback to invoke when a node is selected.
     * @param {TreeNode} node - Node instance.
     * @group Emits
     */
    @Output() onNodeSelect: EventEmitter<TreeNode> = new EventEmitter<TreeNode>();

    _showTransitionOptions: string | undefined;

    _hideTransitionOptions: string | undefined;

    @ContentChildren(PrimeTemplate) templates: Nullable<QueryList<PrimeTemplate>>;

    @ViewChild('container') containerEl: Nullable<ElementRef>;

    @ViewChild('focusInput') focusInput: Nullable<ElementRef>;

    @ViewChild('filter') filterViewChild: Nullable<ElementRef>;

    @ViewChild('tree') treeViewChild: Nullable<Tree>;

    @ViewChild('panel') panelEl: Nullable<ElementRef>;

    @ViewChild('overlay') overlayViewChild: Nullable<Overlay>;

    public filteredNodes: TreeNode[] | undefined | null;

    filterValue: Nullable<string> = null;

    serializedValue: Nullable<any[]>;

    valueTemplate: Nullable<TemplateRef<any>>;

    headerTemplate: Nullable<TemplateRef<any>>;

    emptyTemplate: Nullable<TemplateRef<any>>;

    footerTemplate: Nullable<TemplateRef<any>>;

    clearIconTemplate: Nullable<TemplateRef<any>>;

    triggerIconTemplate: Nullable<TemplateRef<any>>;

    filterIconTemplate: Nullable<TemplateRef<any>>;

    closeIconTemplate: Nullable<TemplateRef<any>>;

    itemTogglerIconTemplate: Nullable<TemplateRef<any>>;

    itemCheckboxIconTemplate: Nullable<TemplateRef<any>>;

    itemLoadingIconTemplate: Nullable<TemplateRef<any>>;

    focused: Nullable<boolean>;

    overlayVisible: Nullable<boolean>;

    selfChange: Nullable<boolean>;

    value: any | undefined;

    expandedNodes: any[] = [];

    _options: TreeNode[] | undefined;

    public templateMap: any;

    onModelChange: Function = () => { };

    onModelTouched: Function = () => { };

    constructor(public config: PrimeNGConfig, public cd: ChangeDetectorRef, public el: ElementRef, public overlayService: OverlayService) { }

    ngOnInit() {
        this.updateTreeState();
    }

    ngAfterContentInit() {
        if ((this.templates as QueryList<PrimeTemplate>).length) {
            this.templateMap = {};
        }

        (this.templates as QueryList<PrimeTemplate>).forEach((item) => {
            switch (item.getType()) {
                case 'value':
                    this.valueTemplate = item.template;
                    break;

                case 'header':
                    this.headerTemplate = item.template;
                    break;

                case 'empty':
                    this.emptyTemplate = item.template;
                    break;

                case 'footer':
                    this.footerTemplate = item.template;
                    break;

                case 'clearicon':
                    this.clearIconTemplate = item.template;
                    break;

                case 'triggericon':
                    this.triggerIconTemplate = item.template;
                    break;

                case 'filtericon':
                    this.filterIconTemplate = item.template;
                    break;

                case 'closeicon':
                    this.closeIconTemplate = item.template;
                    break;

                case 'itemtogglericon':
                    this.itemTogglerIconTemplate = item.template;
                    break;

                case 'itemcheckboxicon':
                    this.itemCheckboxIconTemplate = item.template;
                    break;

                case 'itemloadingicon':
                    this.itemLoadingIconTemplate = item.template;
                    break;

                default: //TODO: @deprecated Used "value" template instead
                    if (item.name) this.templateMap[item.name] = item.template;
                    else this.valueTemplate = item.template;
                    break;
            }
        });
    }

    onOverlayAnimationStart(event: AnimationEvent) {
        switch (event.toState) {
            case 'visible':
                if (this.filter) {
                    ObjectUtils.isNotEmpty(this.filterValue) && this.treeViewChild?._filter(<any>this.filterValue);
                    this.filterInputAutoFocus && this.filterViewChild?.nativeElement.focus();
                }

                break;
        }
    }

    onSelectionChange(event: Event) {
        this.value = event;
        this.onModelChange(this.value);
        this.cd.markForCheck();
    }

    onClick(event: Event) {
        if (this.disabled) {
            return;
        }

        if (!this.overlayViewChild?.el?.nativeElement?.contains(event.target) && !DomHandler.hasClass(event.target, 'p-treeselect-close')) {
            if (this.overlayVisible) {
                this.hide();
            } else {
                this.show();
            }

            this.focusInput?.nativeElement.focus();
        }
    }

    onKeyDown(event: KeyboardEvent) {
        switch (event.which) {
            //down
            case 40:
                if (!this.overlayVisible && event.altKey) {
                    this.show();
                    event.preventDefault();
                } else if (this.overlayVisible && this.panelEl?.nativeElement) {
                    let focusableElements = DomHandler.getFocusableElements(this.panelEl.nativeElement);

                    if (focusableElements && focusableElements.length > 0) {
                        focusableElements[0].focus();
                    }

                    event.preventDefault();
                }
                break;

            //space
            case 32:
                if (!this.overlayVisible) {
                    this.show();
                    event.preventDefault();
                }
                break;

            //enter and escape
            case 13:
            case 27:
                if (this.overlayVisible) {
                    this.hide();
                    event.preventDefault();
                }
                break;

            //tab
            case 9:
                this.hide();
                break;

            default:
                break;
        }
    }

    onFilterInput(event: Event) {
        this.filterValue = (event.target as HTMLInputElement).value;
        this.treeViewChild?._filter(this.filterValue);
        this.onFilter.emit({
            originalEvent: event,
            filteredValue: this.treeViewChild?.filteredNodes
        });
    }

    show() {
        this.overlayVisible = true;
    }

    hide(event?: any) {
        this.overlayVisible = false;
        this.resetFilter();

        this.onHide.emit(event);
        this.cd.markForCheck();
    }

    clear(event: Event) {
        this.value = null;
        this.resetExpandedNodes();
        this.resetPartialSelected();
        this.onModelChange(this.value);
        this.onClear.emit();

        event.stopPropagation();
    }

    checkValue() {
        return this.value !== null && ObjectUtils.isNotEmpty(this.value);
    }

    resetFilter() {
        if (this.filter && !this.resetFilterOnHide) {
            this.filteredNodes = this.treeViewChild?.filteredNodes;
            this.treeViewChild?.resetFilter();
        } else {
            this.filterValue = null;
        }
    }

    updateTreeState() {
        if (this.value) {
            let selectedNodes = this.selectionMode === 'single' ? [this.value] : [...this.value];
            this.resetExpandedNodes();
            this.resetPartialSelected();
            if (selectedNodes && this.options) {
                this.updateTreeBranchState(null, null, selectedNodes);
            }
        }
    }

    updateTreeBranchState(node: TreeNode | null, path: any, selectedNodes: TreeNode[]) {
        if (node) {
            if (this.isSelected(node)) {
                this.expandPath(path);
                selectedNodes.splice(selectedNodes.indexOf(node), 1);
            }

            if (selectedNodes.length > 0 && node.children) {
                for (let childNode of node.children) {
                    this.updateTreeBranchState(childNode, [...path, node], selectedNodes);
                }
            }
        } else {
            for (let childNode of this.options as TreeNode[]) {
                this.updateTreeBranchState(childNode, [], selectedNodes);
            }
        }
    }

    expandPath(expandedNodes: TreeNode[]) {
        for (let node of expandedNodes) {
            node.expanded = true;
        }

        this.expandedNodes = [...expandedNodes];
    }

    nodeExpand(event: { originalEvent: Event; node: TreeNode }) {
        this.onNodeExpand.emit(event);
        this.expandedNodes.push(event.node);
    }

    nodeCollapse(event: { originalEvent: Event; node: TreeNode }) {
        this.onNodeCollapse.emit(event);
        this.expandedNodes.splice(this.expandedNodes.indexOf(event.node), 1);
    }

    resetExpandedNodes() {
        for (let node of this.expandedNodes) {
            node.expanded = false;
        }

        this.expandedNodes = [];
    }

    resetPartialSelected(nodes = this.options): void {
        if (!nodes) {
            return;
        }

        for (let node of nodes) {
            node.partialSelected = false;

            if (node.children && node.children?.length > 0) {
                this.resetPartialSelected(node.children);
            }
        }
    }

    findSelectedNodes(node: TreeNode, keys: any[], selectedNodes: TreeNode[]) {
        if (node) {
            if (this.isSelected(node)) {
                selectedNodes.push(node);
                delete keys[node.key as any];
            }

            if (Object.keys(keys).length && node.children) {
                for (let childNode of node.children) {
                    this.findSelectedNodes(childNode, keys, selectedNodes);
                }
            }
        } else {
            for (let childNode of this.options as TreeNode[]) {
                this.findSelectedNodes(childNode, keys, selectedNodes);
            }
        }
    }

    isSelected(node: TreeNode) {
        return this.findIndexInSelection(node) != -1;
    }

    findIndexInSelection(node: TreeNode) {
        let index: number = -1;

        if (this.value) {
            if (this.selectionMode === 'single') {
                let areNodesEqual = (this.value.key && this.value.key === node.key) || this.value == node;
                index = areNodesEqual ? 0 : -1;
            } else {
                for (let i = 0; i < this.value.length; i++) {
                    let selectedNode = this.value[i];
                    let areNodesEqual = (selectedNode.key && selectedNode.key === node.key) || selectedNode == node;
                    if (areNodesEqual) {
                        index = i;
                        break;
                    }
                }
            }
        }

        return index;
    }

    onSelect(node: TreeNode) {
        this.onNodeSelect.emit(node);

        if (this.selectionMode === 'single') {
            this.hide();
        }
    }

    onUnselect(node: TreeNode) {
        this.onNodeUnselect.emit(node);
    }

    onFocus() {
        this.focused = true;
    }

    onBlur() {
        this.focused = false;
    }

    writeValue(value: any): void {
        this.value = value;
        this.updateTreeState();
        this.cd.markForCheck();
    }

    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }

    setDisabledState(val: boolean): void {
        this.disabled = val;
        this.cd.markForCheck();
    }

    containerClass() {
        return {
            'p-treeselect p-component p-inputwrapper': true,
            'p-treeselect-chip': this.display === 'chip',
            'p-disabled': this.disabled,
            'p-focus': this.focused
        };
    }

    labelClass() {
        return {
            'p-treeselect-label': true,
            'p-placeholder': this.label === this.placeholder,
            'p-treeselect-label-empty': !this.placeholder && this.emptyValue
        };
    }

    get emptyValue() {
        return !this.value || Object.keys(this.value).length === 0;
    }

    get emptyOptions() {
        return !this.options || this.options.length === 0;
    }

    get label() {
        let value = this.value || [];
        return value.length ? value.map((node: TreeNode) => node.label).join(', ') : this.selectionMode === 'single' && this.value ? value.label : this.placeholder;
    }
}

