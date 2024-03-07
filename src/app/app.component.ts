import { Component } from '@angular/core';
import {  MessageService } from 'primeng/api';
import { NodeService } from './nodeservice';
import { TreeNode } from './models.ts/treenode';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  styles: [`
      :host ::ng-deep .p-treeselect {
          width:20rem;
          display: inline-flex;
      }
  `],
  providers: [MessageService]
})
export class AppComponent {
  nodes1!: any[];

  nodes2!: any[];

  nodes3!: any[];

  selectedNodes1: any[] = [];

  selectedNodes2: any[] = [];

  selectedNode: any;

  constructor(public nodeService: NodeService) { }

  ngOnInit() {
    this.nodeService.getFiles().then(files => this.nodes1 = files);
    this.nodeService.getFiles().then(files => this.nodes2 = files);
    this.nodeService.getFiles().then(files => this.nodes3 = files);
    this.nodeService.getFiles().then(files => this.files1 = files);
    //this.setFiles1();
  }

  files1: TreeNode[] = [];

  setFiles1() {
    this.files1 = [
      {
        label: 'A',
        children: [
          {
            label: 'B',

            children: [
              {
                label: 'C',
              },
              {
                label: 'D',
              },
            ],
          },
          {
            label: 'E',

            children: [
              {
                label: 'F',
              },
            ],
          },
        ],
      },
      {
        label: 'G',

        children: [
          {
            label: 'H',
          },
          {
            label: 'I',
          },
          {
            label: 'J',
          },
        ],
      },
    ];
  }
}
