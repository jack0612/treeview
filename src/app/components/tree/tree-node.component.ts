import {
    Component, Input, OnInit,
    Inject, forwardRef, ViewEncapsulation,
} from '@angular/core';

import { TreeNode } from 'primeng/api';
;
import { Tree } from './tree';
import { DomHandler } from 'src/app/utility/domhandler';

@Component({
    selector: 'p-treeNode',
    templateUrl: './tree-node.component.html',
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'p-element'
    }
})
export class UITreeNode implements OnInit {

    static ICON_CLASS: string = 'p-treenode-icon ';

    @Input() rowNode: any;

    @Input() node!: TreeNode;

    @Input() parentNode!: TreeNode;

    @Input() root!: boolean;

    @Input() index!: number;

    @Input() firstChild!: boolean;

    @Input() lastChild!: boolean;

    @Input() level!: number;

    @Input() indentation!: number;

    @Input() itemSize!: number;

    tree: Tree;

    constructor(@Inject(forwardRef(() => Tree)) tree: any) {
        this.tree = tree as Tree;
    }

    draghoverPrev!: boolean;

    draghoverNext!: boolean;

    draghoverNode!: boolean

    ngOnInit() {
        this.node.parent = this.parentNode;

        if (this.parentNode) {
            this.tree.syncNodeOption(this.node, this.tree.value, 'parent', this.tree.getNodeWithKey(this.parentNode.key, this.tree.value));
        }
    }

    getIcon() {
        let icon: string;

        if (this.node.icon)
            icon = this.node.icon;
        else
            icon = this.node.expanded && this.node.children && this.node.children.length ? this.node.expandedIcon : this.node.collapsedIcon;

        return UITreeNode.ICON_CLASS + ' ' + icon;
    }

    isLeaf() {
        return this.tree.isNodeLeaf(this.node);
    }

    toggle(event: Event) {
        if (this.node.expanded)
            this.collapse(event);
        else
            this.expand(event);
    }

    expand(event: Event) {
        this.node.expanded = true;
        if (this.tree.virtualScroll) {
            this.tree.updateSerializedValue();
        }
        this.tree.onNodeExpand.emit({ originalEvent: event, node: this.node });
    }

    collapse(event: Event) {
        this.node.expanded = false;
        if (this.tree.virtualScroll) {
            this.tree.updateSerializedValue();
        }
        this.tree.onNodeCollapse.emit({ originalEvent: event, node: this.node });
    }

    onNodeClick(event: MouseEvent) {
        this.tree.onNodeClick(event, this.node);
    }

    onNodeKeydown(event: KeyboardEvent) {
        if (event.which === 13) {
            this.tree.onNodeClick(event, this.node);
        }
    }

    onNodeTouchEnd() {
        this.tree.onNodeTouchEnd();
    }

    onNodeRightClick(event: MouseEvent) {
        this.tree.onNodeRightClick(event, this.node);
    }

    isSelected() {
        return this.tree.isSelected(this.node);
    }

    onDropPoint(event: Event, position: number) {
        event.preventDefault();
        let dragNode = this.tree.dragNode;
        let dragNodeIndex = this.tree.dragNodeIndex;
        let dragNodeScope = this.tree.dragNodeScope;
        let isValidDropPointIndex = this.tree.dragNodeTree === this.tree ? (position === 1 || dragNodeIndex !== this.index - 1) : true;

        if (this.tree.allowDrop(dragNode, this.node, dragNodeScope) && isValidDropPointIndex) {
            let dropParams = { ...this.createDropPointEventMetadata(position) };

            if (this.tree.validateDrop) {
                this.tree.onNodeDrop.emit({
                    originalEvent: event,
                    dragNode: dragNode,
                    dropNode: this.node,
                    index: this.index,
                    accept: () => {
                        this.processPointDrop(dropParams);
                    }
                });
            }
            else {
                this.processPointDrop(dropParams);
                this.tree.onNodeDrop.emit({
                    originalEvent: event,
                    dragNode: dragNode,
                    dropNode: this.node,
                    index: this.index
                });
            }
        }

        this.draghoverPrev = false;
        this.draghoverNext = false;
    }

    processPointDrop(event: any) {
        let newNodeList = event.dropNode.parent ? event.dropNode.parent.children : this.tree.value;
        event.dragNodeSubNodes.splice(event.dragNodeIndex, 1);
        let dropIndex = this.index;

        if (event.position < 0) {
            dropIndex = (event.dragNodeSubNodes === newNodeList) ? ((event.dragNodeIndex > event.index) ? event.index : event.index - 1) : event.index;
            newNodeList.splice(dropIndex, 0, event.dragNode);
        }
        else {
            dropIndex = newNodeList.length;
            newNodeList.push(event.dragNode);
        }

        this.tree.dragDropService.stopDrag({
            node: event.dragNode,
            subNodes: event.dropNode.parent ? event.dropNode.parent.children : this.tree.value,
            index: event.dragNodeIndex
        });
    }

    createDropPointEventMetadata(position: any) {
        return {
            dragNode: this.tree.dragNode,
            dragNodeIndex: this.tree.dragNodeIndex,
            dragNodeSubNodes: this.tree.dragNodeSubNodes,
            dropNode: this.node,
            index: this.index,
            position: position
        };
    }

    onDropPointDragOver(event: any) {
        event.dataTransfer.dropEffect = 'move';
        event.preventDefault();
    }

    onDropPointDragEnter(event: Event, position: number) {
        if (this.tree.allowDrop(this.tree.dragNode, this.node, this.tree.dragNodeScope)) {
            if (position < 0)
                this.draghoverPrev = true;
            else
                this.draghoverNext = true;
        }
    }

    onDropPointDragLeave(event: Event) {
        this.draghoverPrev = false;
        this.draghoverNext = false;
    }

    onDragStart(event: any) {
        if (this.tree.draggableNodes && this.node.draggable !== false) {
            event.dataTransfer.setData("text", "data");

            this.tree.dragDropService.startDrag({
                tree: this,
                node: this.node,
                subNodes: this.node.parent ? this.node.parent.children : this.tree.value,
                index: this.index,
                scope: this.tree.draggableScope
            });
        }
        else {
            event.preventDefault();
        }
    }

    onDragStop(event: any) {
        this.tree.dragDropService.stopDrag({
            node: this.node,
            subNodes: this.node.parent ? this.node.parent.children : this.tree.value,
            index: this.index
        });
    }

    onDropNodeDragOver(event: any) {
        event.dataTransfer.dropEffect = 'move';
        if (this.tree.droppableNodes) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    onDropNode(event: any) {
        if (this.tree.droppableNodes && this.node.droppable !== false) {
            let dragNode = this.tree.dragNode;

            if (this.tree.allowDrop(dragNode, this.node, this.tree.dragNodeScope)) {
                let dropParams = { ...this.createDropNodeEventMetadata() };

                if (this.tree.validateDrop) {
                    this.tree.onNodeDrop.emit({
                        originalEvent: event,
                        dragNode: dragNode,
                        dropNode: this.node,
                        index: this.index,
                        accept: () => {
                            this.processNodeDrop(dropParams);
                        }
                    });
                }
                else {
                    this.processNodeDrop(dropParams);
                    this.tree.onNodeDrop.emit({
                        originalEvent: event,
                        dragNode: dragNode,
                        dropNode: this.node,
                        index: this.index
                    });
                }
            }
        }

        event.preventDefault();
        event.stopPropagation();
        this.draghoverNode = false;
    }

    createDropNodeEventMetadata() {
        return {
            dragNode: this.tree.dragNode,
            dragNodeIndex: this.tree.dragNodeIndex,
            dragNodeSubNodes: this.tree.dragNodeSubNodes,
            dropNode: this.node
        };
    }

    processNodeDrop(event: any) {
        let dragNodeIndex = event.dragNodeIndex;
        event.dragNodeSubNodes.splice(dragNodeIndex, 1);

        if (event.dropNode.children)
            event.dropNode.children.push(event.dragNode);
        else
            event.dropNode.children = [event.dragNode];

        this.tree.dragDropService.stopDrag({
            node: event.dragNode,
            subNodes: event.dropNode.parent ? event.dropNode.parent.children : this.tree.value,
            index: dragNodeIndex
        });
    }

    onDropNodeDragEnter(event: any) {
        if (this.tree.droppableNodes && this.node.droppable !== false && this.tree.allowDrop(this.tree.dragNode, this.node, this.tree.dragNodeScope)) {
            this.draghoverNode = true;
        }
    }

    onDropNodeDragLeave(event: any) {
        if (this.tree.droppableNodes) {
            let rect = event.currentTarget.getBoundingClientRect();
            if (event.x > rect.left + rect.width || event.x < rect.left || event.y >= Math.floor(rect.top + rect.height) || event.y < rect.top) {
                this.draghoverNode = false;
            }
        }
    }

    onKeyDown(event: KeyboardEvent) {
        const nodeElement = (<HTMLDivElement>event.target).parentElement?.parentElement;

        if (nodeElement?.nodeName !== 'P-TREENODE' || (this.tree.contextMenu && this.tree.contextMenu.containerViewChild.nativeElement.style.display === 'block')) {
            return;
        }

        switch (event.which) {
            //down arrow
            case 40:
                const listElement = (this.tree.droppableNodes) ? nodeElement.children[1].children[1] : nodeElement.children[0].children[1];
                if (listElement && listElement.children.length > 0) {
                    this.focusNode(listElement.children[0]);
                }
                else {
                    const nextNodeElement = nodeElement.nextElementSibling;
                    if (nextNodeElement) {
                        this.focusNode(nextNodeElement);
                    }
                    else {
                        let nextSiblingAncestor = this.findNextSiblingOfAncestor(nodeElement);
                        if (nextSiblingAncestor) {
                            this.focusNode(nextSiblingAncestor);
                        }
                    }
                }

                event.preventDefault();
                break;

            //up arrow
            case 38:
                if (nodeElement.previousElementSibling) {
                    this.focusNode(this.findLastVisibleDescendant(nodeElement.previousElementSibling));
                }
                else {
                    let parentNodeElement = this.getParentNodeElement(nodeElement);
                    if (parentNodeElement) {
                        this.focusNode(parentNodeElement);
                    }
                }

                event.preventDefault();
                break;

            //right arrow
            case 39:
                if (!this.node.expanded && !this.tree.isNodeLeaf(this.node)) {
                    this.expand(event);
                }

                event.preventDefault();
                break;

            //left arrow
            case 37:
                if (this.node.expanded) {
                    this.collapse(event);
                }
                else {
                    let parentNodeElement = this.getParentNodeElement(nodeElement);
                    if (parentNodeElement) {
                        this.focusNode(parentNodeElement);
                    }
                }

                event.preventDefault();
                break;

            //enter
            case 13:
                this.tree.onNodeClick(event, this.node);
                event.preventDefault();
                break;

            default:
                //no op
                break;
        }
    }

    findNextSiblingOfAncestor(nodeElement: any): any {
        let parentNodeElement = this.getParentNodeElement(nodeElement);
        if (parentNodeElement) {
            if (parentNodeElement.nextElementSibling)
                return parentNodeElement.nextElementSibling;
            else
                return this.findNextSiblingOfAncestor(parentNodeElement);
        }
        else {
            return null;
        }
    }

    findLastVisibleDescendant(nodeElement: any): any {
        const listElement = <HTMLElement>Array.from(nodeElement.children).find(el => DomHandler.hasClass(el, 'p-treenode'));
        const childrenListElement = listElement.children[1];
        if (childrenListElement && childrenListElement.children.length > 0) {
            const lastChildElement = childrenListElement.children[childrenListElement.children.length - 1];

            return this.findLastVisibleDescendant(lastChildElement);
        }
        else {
            return nodeElement;
        }
    }

    getParentNodeElement(nodeElement: any) {
        const parentNodeElement = nodeElement.parentElement.parentElement.parentElement;

        return parentNodeElement.tagName === 'P-TREENODE' ? parentNodeElement : null;
    }

    focusNode(element: any) {
        if (this.tree.droppableNodes)
            element.children[1].children[0].focus();
        else
            element.children[0].children[0].focus();
    }
}
