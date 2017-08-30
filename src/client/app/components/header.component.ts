import { Component, EventEmitter, ChildListener, Output } from '../../core';
import { listen, findElement } from '../../util';

@Component({
  selector: 'header'
})
export class HeaderComponent {
  @Output()
  onToggleDrawer = new EventEmitter();

  @ChildListener('.toggle-drawer', 'click')
  drawerBtnClicked() {
    this.onToggleDrawer.emit();
    return false;
  }
}
