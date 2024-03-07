import {
    Component, Input, AfterContentInit, OnDestroy, Output, EventEmitter, OnInit, OnChanges,
    ContentChildren, QueryList, TemplateRef, Inject, ElementRef, forwardRef, ChangeDetectionStrategy, SimpleChanges, ViewEncapsulation, ViewChild
} from '@angular/core';
import { Optional } from '@angular/core';
import { PrimeNGConfig, TranslationKeys } from 'primeng/api';
 
import { TreeDragDropService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { BlockableUI } from 'primeng/api';
import { Scroller, ScrollerOptions } from 'primeng/scroller';
import { DomHandler } from 'src/app/utility/domhandler';
import { PrimeTemplate } from '../api/shared';
import { ObjectUtils } from 'src/app/utility/objectutils';
import { TreeNode } from 'src/app/models.ts/treenode';


@Component({
    selector: 'p-tree',
    templateUrl: './tree.component.html',
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./tree.css'],
    host: {
        'class': 'p-element'
    }
})
export class Tree implements OnInit, AfterContentInit, OnChanges, OnDestroy, BlockableUI {

    @Input() value!: TreeNode[];

    @Input() selectionMode!: string;

    @Input() selection: any;

    @Input() style: any;

    @Input() styleClass!: string;

    @Input() contextMenu: any;

    @Input() layout: string = 'vertical';

    @Input() draggableScope: any;

    @Input() droppableScope: any;

    @Input() draggableNodes!: boolean;

    @Input() droppableNodes!: boolean;

    @Input() metaKeySelection: boolean = true;

    @Input() propagateSelectionUp: boolean = true;

    @Input() propagateSelectionDown: boolean = true;

    @Input() loading!: boolean;

    @Input() loadingIcon: string = 'pi pi-spinner';

    @Input() emptyMessage: string = '';

    @Input() ariaLabel!: string;

    @Input() togglerAriaLabel!: string;

    @Input() ariaLabelledBy!: string;

    @Input() validateDrop!: boolean;

    @Input() filter!: boolean;

    @Input() filterBy: string = 'label';

    @Input() filterMode: string = 'lenient';

    @Input() filterPlaceholder!: string;

    @Input() filteredNodes!: TreeNode[] | null;

    @Input() filterLocale!: string;

    @Input() scrollHeight!: string;

    @Input() lazy: boolean = false;

    @Input() virtualScroll!: boolean;

    @Input() virtualScrollItemSize!: number;

    @Input() virtualScrollOptions!: ScrollerOptions;

    @Input() indentation: number = 1.5;

    @Input() trackBy: Function = (index: number, item: any) => item;

    @Output() selectionChange: EventEmitter<any> = new EventEmitter();

    @Output() onNodeSelect: EventEmitter<any> = new EventEmitter();

    @Output() onNodeUnselect: EventEmitter<any> = new EventEmitter();

    @Output() onNodeExpand: EventEmitter<any> = new EventEmitter();

    @Output() onNodeCollapse: EventEmitter<any> = new EventEmitter();

    @Output() onNodeContextMenuSelect: EventEmitter<any> = new EventEmitter();

    @Output() onNodeDrop: EventEmitter<any> = new EventEmitter();

    @Output() onLazyLoad: EventEmitter<any> = new EventEmitter();

    @Output() onScroll: EventEmitter<any> = new EventEmitter();

    @Output() onScrollIndexChange: EventEmitter<any> = new EventEmitter();

    @Output() onFilter: EventEmitter<any> = new EventEmitter();

    @ContentChildren(PrimeTemplate) templates!: QueryList<any>;

    @ViewChild('filter') filterViewChild!: ElementRef;

    @ViewChild('scroller') scroller!: Scroller;

    @ViewChild('wrapper') wrapperViewChild!: ElementRef;

    /* @deprecated */
    _virtualNodeHeight!: number;
    @Input() get virtualNodeHeight(): number {
        return this._virtualNodeHeight;
    }
    set virtualNodeHeight(val: number) {
        this._virtualNodeHeight = val;
        console.warn("The virtualNodeHeight property is deprecated, use virtualScrollItemSize property instead.");
    }

    serializedValue!: any[];

    headerTemplate!: TemplateRef<any>;

    footerTemplate!: TemplateRef<any>;

    loaderTemplate!: TemplateRef<any>;

    emptyMessageTemplate!: TemplateRef<any>;

    public templateMap: any;

    public nodeTouched!: boolean;

    public dragNodeTree!: Tree | null;

    public dragNode!: TreeNode | null;

    public dragNodeSubNodes!: TreeNode[] | null;

    public dragNodeIndex!: number | null;

    public dragNodeScope: any;

    public dragHover!: boolean;

    public dragStartSubscription!: Subscription;

    public dragStopSubscription!: Subscription;

    constructor(public el: ElementRef, @Optional() public dragDropService: TreeDragDropService, public config: PrimeNGConfig) { }

    ngOnInit() {
        if (this.droppableNodes) {
            this.dragStartSubscription = this.dragDropService.dragStart$.subscribe(
                event => {
                    this.dragNodeTree = event.tree;
                    this.dragNode = event.node as TreeNode<any>;
                    this.dragNodeSubNodes = event.subNodes as TreeNode<any>[];
                    this.dragNodeIndex = event.index as number;
                    this.dragNodeScope = event.scope;
                });

            this.dragStopSubscription = this.dragDropService.dragStop$.subscribe(
                event => {
                    this.dragNodeTree = null;
                    this.dragNode = null;
                    this.dragNodeSubNodes = null;
                    this.dragNodeIndex = null;
                    this.dragNodeScope = null;
                    this.dragHover = false;
                });
        }
    }

    ngOnChanges(simpleChange: SimpleChanges) {
        if (simpleChange['value']) {
            this.updateSerializedValue();
        }
    }

    get horizontal(): boolean {
        return this.layout == 'horizontal';
    }

    get emptyMessageLabel(): string {
        return this.emptyMessage || this.config.getTranslation(TranslationKeys.EMPTY_MESSAGE);
    }

    ngAfterContentInit() {
        if (this.templates.length) {
            this.templateMap = {};
        }

        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    this.headerTemplate = item.template;
                    break;

                case 'empty':
                    this.emptyMessageTemplate = item.template;
                    break;

                case 'footer':
                    this.footerTemplate = item.template;
                    break;

                case 'loader':
                    this.loaderTemplate = item.template;
                    break;

                default:
                    this.templateMap[item.name] = item.template;
                    break;
            }
        });
    }

    updateSerializedValue() {
        this.serializedValue = [];
        this.serializeNodes(null, this.getRootNode(), 0, true);
    }

    serializeNodes(parent: any, nodes: any, level: any, visible: any) {
        if (nodes && nodes.length) {
            for (let node of nodes) {
                node.parent = parent;
                const rowNode = {
                    node: node,
                    parent: parent,
                    level: level,
                    visible: visible && (parent ? parent.expanded : true)
                };
                this.serializedValue.push(rowNode);

                if (rowNode.visible && node.expanded) {
                    this.serializeNodes(node, node.children, level + 1, rowNode.visible);
                }
            }
        }
    }

    onNodeClick(event: any, node: TreeNode) {
        let eventTarget = (<Element>event.target);

        if (DomHandler.hasClass(eventTarget, 'p-tree-toggler') || DomHandler.hasClass(eventTarget, 'p-tree-toggler-icon')) {
            return;
        }
        else if (this.selectionMode) {
            if (node.selectable === false) {
                return;
            }

            if (this.hasFilteredNodes()) {
                node = this.getNodeWithKey(node.key as string, this.value);

                if (!node) {
                    return;
                }
            }

            let index = this.findIndexInSelection(node);
            let selected = (index >= 0);

            if (this.isCheckboxSelectionMode()) {
                if (selected) {
                    if (this.propagateSelectionDown)
                        this.propagateDown(node, false);
                    else
                        this.selection = this.selection.filter((val: any, i: number) => i != index);

                    if (this.propagateSelectionUp && node.parent) {
                        this.propagateUp(node.parent, false);
                    }

                    this.selectionChange.emit(this.selection);
                    this.onNodeUnselect.emit({ originalEvent: event, node: node });
                }
                else {
                    if (this.propagateSelectionDown)
                        this.propagateDown(node, true);
                    else
                        this.selection = [...this.selection || [], node];

                    if (this.propagateSelectionUp && node.parent) {
                        this.propagateUp(node.parent, true);
                    }

                    this.selectionChange.emit(this.selection);
                    this.onNodeSelect.emit({ originalEvent: event, node: node });
                }
            }
            else {
                let metaSelection = this.nodeTouched ? false : this.metaKeySelection;

                if (metaSelection) {
                    let metaKey = (event.metaKey || event.ctrlKey);

                    if (selected && metaKey) {
                        if (this.isSingleSelectionMode()) {
                            this.selectionChange.emit(null);
                        }
                        else {
                            this.selection = this.selection.filter((val: any, i: number) => i != index);
                            this.selectionChange.emit(this.selection);
                        }

                        this.onNodeUnselect.emit({ originalEvent: event, node: node });
                    }
                    else {
                        if (this.isSingleSelectionMode()) {
                            this.selectionChange.emit(node);
                        }
                        else if (this.isMultipleSelectionMode()) {
                            this.selection = (!metaKey) ? [] : this.selection || [];
                            this.selection = [...this.selection, node];
                            this.selectionChange.emit(this.selection);
                        }

                        this.onNodeSelect.emit({ originalEvent: event, node: node });
                    }
                }
                else {
                    if (this.isSingleSelectionMode()) {
                        if (selected) {
                            this.selection = null;
                            this.onNodeUnselect.emit({ originalEvent: event, node: node });
                        }
                        else {
                            this.selection = node;
                            this.onNodeSelect.emit({ originalEvent: event, node: node });
                        }
                    }
                    else {
                        if (selected) {
                            this.selection = this.selection.filter((val: any, i: number) => i != index);
                            this.onNodeUnselect.emit({ originalEvent: event, node: node });
                        }
                        else {
                            this.selection = [...this.selection || [], node];
                            this.onNodeSelect.emit({ originalEvent: event, node: node });
                        }
                    }

                    this.selectionChange.emit(this.selection);
                }
            }
        }

        this.nodeTouched = false;
    }

    onNodeTouchEnd() {
        this.nodeTouched = true;
    }

    onNodeRightClick(event: MouseEvent, node: TreeNode) {
        if (this.contextMenu) {
            let eventTarget = (<Element>event.target);

            if (eventTarget.className && eventTarget.className.indexOf('p-tree-toggler') === 0) {
                return;
            }
            else {
                let index = this.findIndexInSelection(node);
                let selected = (index >= 0);

                if (!selected) {
                    if (this.isSingleSelectionMode())
                        this.selectionChange.emit(node);
                    else
                        this.selectionChange.emit([node]);
                }

                this.contextMenu.show(event);
                this.onNodeContextMenuSelect.emit({ originalEvent: event, node: node });
            }
        }
    }

    findIndexInSelection(node: TreeNode) {
        let index: number = -1;

        if (this.selectionMode && this.selection) {
            if (this.isSingleSelectionMode()) {
                let areNodesEqual = (this.selection.key && this.selection.key === node.key) || this.selection == node;
                index = areNodesEqual ? 0 : - 1;
            }
            else {
                for (let i = 0; i < this.selection.length; i++) {
                    let selectedNode = this.selection[i];
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

    syncNodeOption(node: any, parentNodes: any, option: any, value?: any) {
        // to synchronize the node option between the filtered nodes and the original nodes(this.value)
        const _node = this.hasFilteredNodes() ? this.getNodeWithKey(node.key, parentNodes) : null;
        if (_node) {
            _node[option] = value || node[option];
        }
    }

    hasFilteredNodes() {
        return this.filter && this.filteredNodes && this.filteredNodes.length;
    }

    getNodeWithKey(key: string | undefined, nodes: TreeNode[]) {
        for (let node of nodes) {
            if (node.key === key) {
                return node;
            }

            if (node.children) {
                let matchedNode: any = this.getNodeWithKey(key, node.children);
                if (matchedNode) {
                    return matchedNode;
                }
            }
        }
    }

    propagateUp(node: TreeNode, select: boolean) {
        if (node.children && node.children.length) {
            let selectedCount: number = 0;
            let childPartialSelected: boolean = false;
            for (let child of node.children) {
                if (this.isSelected(child)) {
                    selectedCount++;
                }
                else if (child.partialSelected) {
                    childPartialSelected = true;
                }
            }

            if (select && selectedCount == node.children.length) {
                this.selection = [...this.selection || [], node];
                node.partialSelected = false;
            }
            else {
                if (!select) {
                    let index = this.findIndexInSelection(node);
                    if (index >= 0) {
                        this.selection = this.selection.filter((val: any, i: number) => i != index);
                    }
                }

                if (childPartialSelected || selectedCount > 0 && selectedCount != node.children.length)
                    node.partialSelected = true;
                else
                    node.partialSelected = false;
            }

            this.syncNodeOption(node, this.filteredNodes, 'partialSelected');
        }

        let parent = node.parent;
        if (parent) {
            this.propagateUp(parent, select);
        }
    }

    propagateDown(node: TreeNode, select: boolean) {
        let index = this.findIndexInSelection(node);

        if (select && index == -1) {
            this.selection = [...this.selection || [], node];
        }
        else if (!select && index > -1) {
            this.selection = this.selection.filter((val: any, i: number) => i != index);
        }

        node.partialSelected = false;

        this.syncNodeOption(node, this.filteredNodes, 'partialSelected');

        if (node.children && node.children.length) {
            for (let child of node.children) {
                this.propagateDown(child, select);
            }
        }
    }

    isSelected(node: TreeNode) {
        return this.findIndexInSelection(node) != -1;
    }

    isSingleSelectionMode() {
        return this.selectionMode && this.selectionMode == 'single';
    }

    isMultipleSelectionMode() {
        return this.selectionMode && this.selectionMode == 'multiple';
    }

    isCheckboxSelectionMode() {
        return this.selectionMode && this.selectionMode == 'checkbox';
    }

    isNodeLeaf(node: any) {
        return node.leaf == false ? false : !(node.children && node.children.length);
    }

    getRootNode() {
        return this.filteredNodes ? this.filteredNodes : this.value;
    }

    getTemplateForNode(node: TreeNode): TemplateRef<any> | null {
        if (this.templateMap)
            return node.type ? this.templateMap[node.type] : this.templateMap['default'];
        else
            return null;
    }

    onDragOver(event: any) {
        if (this.droppableNodes && (!this.value || this.value.length === 0)) {
            event.dataTransfer.dropEffect = 'move';
            event.preventDefault();
        }
    }

    onDrop(event: any) {
        if (this.droppableNodes && (!this.value || this.value.length === 0)) {
            event.preventDefault();
            let dragNode = this.dragNode;

            if (this.allowDrop(dragNode, null, this.dragNodeScope)) {
                let dragNodeIndex = this.dragNodeIndex;
                this.value = this.value || [];

                if (this.validateDrop) {
                    this.onNodeDrop.emit({
                        originalEvent: event,
                        dragNode: dragNode,
                        dropNode: null,
                        index: dragNodeIndex,
                        accept: () => {
                            this.processTreeDrop(dragNode, dragNodeIndex);
                        }
                    });
                }
                else {
                    this.onNodeDrop.emit({
                        originalEvent: event,
                        dragNode: dragNode,
                        dropNode: null,
                        index: dragNodeIndex
                    });

                    this.processTreeDrop(dragNode, dragNodeIndex);
                }
            }
        }
    }

    processTreeDrop(dragNode: any, dragNodeIndex: any) {
        this.dragNodeSubNodes?.splice(dragNodeIndex, 1);
        this.value.push(dragNode);
        this.dragDropService.stopDrag({
            node: dragNode
        });
    }

    onDragEnter() {
        if (this.droppableNodes && this.allowDrop(this.dragNode, null, this.dragNodeScope)) {
            this.dragHover = true;
        }
    }

    onDragLeave(event: any) {
        if (this.droppableNodes) {
            let rect = event.currentTarget.getBoundingClientRect();
            if (event.x > rect.left + rect.width || event.x < rect.left || event.y > rect.top + rect.height || event.y < rect.top) {
                this.dragHover = false;
            }
        }
    }

    allowDrop(dragNode: TreeNode | null, dropNode: TreeNode | null, dragNodeScope: any): boolean {
        if (!dragNode) {
            //prevent random html elements to be dragged
            return false;
        }
        else if (this.isValidDragScope(dragNodeScope)) {
            let allow: boolean = true;
            if (dropNode) {
                if (dragNode === dropNode) {
                    allow = false;
                }
                else {
                    let parent = dropNode.parent;
                    while (parent != null) {
                        if (parent === dragNode) {
                            allow = false;
                            break;
                        }
                        parent = parent.parent;
                    }
                }
            }

            return allow;
        }
        else {
            return false;
        }
    }

    isValidDragScope(dragScope: any): boolean {
        let dropScope = this.droppableScope;

        if (dropScope) {
            if (typeof dropScope === 'string') {
                if (typeof dragScope === 'string')
                    return dropScope === dragScope;
                else if (dragScope instanceof Array)
                    return (<Array<any>>dragScope).indexOf(dropScope) != -1;
            }
            else if (dropScope instanceof Array) {
                if (typeof dragScope === 'string') {
                    return (<Array<any>>dropScope).indexOf(dragScope) != -1;
                }
                else if (dragScope instanceof Array) {
                    for (let s of dropScope) {
                        for (let ds of dragScope) {
                            if (s === ds) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }
        else {
            return true;
        }
    }

    public _filter(target: any) {
        const value = target.value;
        let filterValue = value;
        if (filterValue === '') {
            this.filteredNodes = null;
        }
        else {
            this.filteredNodes = [];
            const searchFields: string[] = this.filterBy.split(',');
            const filterText = ObjectUtils.removeAccents(filterValue).toLocaleLowerCase(this.filterLocale);
            const isStrictMode = this.filterMode === 'strict';
            for (let node of this.value) {
                let copyNode = { ...node };
                let paramsWithoutNode = { searchFields, filterText, isStrictMode };
                if ((isStrictMode && (this.findFilteredNodes(copyNode, paramsWithoutNode) || this.isFilterMatched(copyNode, paramsWithoutNode))) ||
                    (!isStrictMode && (this.isFilterMatched(copyNode, paramsWithoutNode) || this.findFilteredNodes(copyNode, paramsWithoutNode)))) {
                    this.filteredNodes.push(copyNode);
                }
            }
        }

        this.updateSerializedValue();
        this.onFilter.emit({
            filter: filterValue,
            filteredValue: this.filteredNodes
        });
    }

    public resetFilter() {
        this.filteredNodes = null;

        if (this.filterViewChild && this.filterViewChild.nativeElement) {
            this.filterViewChild.nativeElement.value = '';
        }
    }

    public scrollToVirtualIndex(index: number) {
        this.virtualScroll && this.scroller.scrollToIndex(index);
    }

    public scrollTo(options: any) {
        if (this.virtualScroll) {
            this.scroller.scrollTo(options);
        }
        else if (this.wrapperViewChild && this.wrapperViewChild.nativeElement) {
            if (this.wrapperViewChild.nativeElement.scrollTo) {
                this.wrapperViewChild.nativeElement.scrollTo(options);
            }
            else {
                this.wrapperViewChild.nativeElement.scrollLeft = options.left;
                this.wrapperViewChild.nativeElement.scrollTop = options.top;
            }
        }
    }

    findFilteredNodes(node: any, paramsWithoutNode: any) {
        if (node) {
            let matched = false;
            if (node.children) {
                let childNodes = [...node.children];
                node.children = [];
                for (let childNode of childNodes) {
                    let copyChildNode = { ...childNode };
                    if (this.isFilterMatched(copyChildNode, paramsWithoutNode)) {
                        matched = true;
                        node.children.push(copyChildNode);
                    }
                }
            }

            if (matched) {
                node.expanded = true;
                return true;
            }
        }
        return false;
    }

    isFilterMatched(node: any, { searchFields, filterText, isStrictMode }: { searchFields: any, filterText: any, isStrictMode: any }) {
        let matched = false;
        for (let field of searchFields) {
            let fieldValue = ObjectUtils.removeAccents(String(ObjectUtils.resolveFieldData(node, field))).toLocaleLowerCase(this.filterLocale);
            if (fieldValue.indexOf(filterText) > -1) {
                matched = true;
            }
        }

        if (!matched || (isStrictMode && !this.isNodeLeaf(node))) {
            matched = this.findFilteredNodes(node, { searchFields, filterText, isStrictMode }) || matched;
        }

        return matched;
    }

    getIndex(options: any, index: any) {
        const getItemOptions = options['getItemOptions'];
        return getItemOptions ? getItemOptions(index).index : index;
    }

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }

    ngOnDestroy() {
        if (this.dragStartSubscription) {
            this.dragStartSubscription.unsubscribe();
        }

        if (this.dragStopSubscription) {
            this.dragStopSubscription.unsubscribe();
        }
    }
}

