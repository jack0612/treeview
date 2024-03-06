import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "primeng/api";
import { RippleModule } from "primeng/ripple";

import { OverlayModule } from "../overlay/overlay";
import { TreeSelect } from "./treeselect.component";
import { ChevronDownIcon } from "../icons/chevrondown";
import { TimesIcon } from "../icons/times";
import { SearchIcon } from "../icons/search";
import { TreeModule } from "../tree/tree.module";


@NgModule({
    imports: [CommonModule, OverlayModule, RippleModule, SharedModule, TreeModule,
        SearchIcon, TimesIcon, ChevronDownIcon],
    exports: [TreeSelect, OverlayModule, SharedModule, TreeModule, SearchIcon, TimesIcon, ChevronDownIcon],
    declarations: [TreeSelect]
})
export class TreeSelectModule { }