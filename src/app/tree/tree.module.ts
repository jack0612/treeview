import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "primeng/api";
import { RippleModule } from "primeng/ripple";
import { ScrollerModule } from "primeng/scroller";
 
import { ChevronDownIcon } from "../icons/chevrondown";
import { SearchIcon } from "../icons/search";
import { Tree } from "./tree";
import { CheckIcon } from "../icons/check";
import { MinusIcon } from "../icons/minus";
import { SpinnerIcon } from "../icons/spinner";
import { PlusIcon } from "../icons/plus";
import { ChevronRightIcon } from "../icons/chevronright";
import { UITreeNode } from "./ui-tree-node";

@NgModule({
    imports: [CommonModule, 
        SharedModule, RippleModule, ScrollerModule, CheckIcon, ChevronDownIcon, ChevronRightIcon, MinusIcon, SearchIcon, SpinnerIcon, PlusIcon],
    exports: [Tree, SharedModule, ScrollerModule],
    declarations: [Tree, UITreeNode]
})
export class TreeModule {}