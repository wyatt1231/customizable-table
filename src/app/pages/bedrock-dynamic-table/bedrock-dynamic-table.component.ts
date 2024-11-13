import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-bedrock-dynamic-table',
  templateUrl: './bedrock-dynamic-table.component.html',
  styleUrls: ['./bedrock-dynamic-table.component.scss'],
})
export class BedrockDynamicTableComponent {
  width = 200; // Initial width of the div
  resize_col_index: number = -1;
  cell_el?: HTMLElement;

  col_length: number = 3;
  row_length: number = 5;

  cols: ITableCol[] = [];
  cells: ITableCell[] = [];
  rows: number[] = [];

  ngOnInit() {
    this.onCreateTable();
  }

  onCreateTable = () => {
    this.cols = [];
    this.cells = [];
    this.rows = [];
    let id = 0;

    for (let i = 0; i < this.col_length; i++) {
      this.cols.push({
        id: i,
        width: 200,
        height: 30,
      });
    }

    for (let x = 0; x < this.row_length; x++) {
      this.rows.push(x);
      for (let i = 0; i < this.cols.length; i++) {
        const cell: ITableCell = {
          id: id,
          column: i,
          row: x,
          width: 120,
          height: 30,
          row_span: 1,
          col_span: 1,
          is_selected: false,
        };
        this.cells.push(cell);

        id++;
      }
    }

    // for (let i = 0; i < this.cols.length; i++) {
    //   for (let x = 0; x < this.row_length; x++) {
    //     const cell: ITableCell = {
    //       id: id,
    //       column: i,
    //       width: 120,
    //       height: 30,
    //       row_span: 1,
    //       col_span: 1,
    //       is_selected: false,
    //     };
    //     this.cells.push(cell);

    //     console.log(`i`, i);
    //     id++;
    //   }
    // }
  };

  onRightClick(event: MouseEvent): void {
    event.preventDefault(); // Prevent the default context menu from appearing
    console.log('Right-click detected at:', event.clientX, event.clientY);
    // Perform any other action, such as showing a custom menu
  }

  getColumnCells = (index: number) => {
    const cells: ITableCell[] = [];
    // this.rows.forEach((r) => {
    //   r.forEach((c) => {
    //     if (index + `` == c?.col_id) {
    //       cells.push(c);
    //     }
    //   });
    // });

    return cells;
  };

  onMergeCell = () => {
    // const first_cell = this.rows.find(
    //   (p) => p.find((x) => x.is_selected)?.is_selected == true
    // );
    // console.log(`first_row`, first_cell);

    let row_spans: any[] = [];

    let first_row = -1;
    let last_row = 1;

    //rowspan

    const columns: number[] = [];
    for (let i = 0; i < this.cells.length; i++) {
      columns.push(i);
    }

    console.log(`columns`, columns);

    // this.cols.forEach((c, ci) => {
    //     let f = this.rows.filter(p => p.)
    // });

    columns.forEach((column) => {
      const column_cells = this.getColumnCells(column);
      const selected = column_cells.filter((p) => p.is_selected);

      console.log(`selected`, selected);

      if (selected.length > 0) {
        // console.log(`column_cells`, column_cells);
        // console.log(`id`, selected[0].id);
        // console.log(`len`, selected[selected.length - 1]);
        // console.log(`len`, selected.length);

        // this.rows.forEach((r, ri) => {
        //   r.forEach((c, ci) => {
        //     if (c.col_id == column + ``) {
        //       if (c.id == selected[0].id) {
        //         c.row_span = selected.length;
        //       } else {
        //         if (c.is_selected) {
        //           c.is_hidden = true;
        //         }
        //       }
        //     }
        //   });
        // });

        console.log({
          id: selected[0].id,
          len: selected.length,
        });
      }
    });
  };

  onInsertRowAbove = () => {
    this.cells.push();
  };

  onInsertRowBelow = () => {};

  getRows = () => {
    const rows = [];
    for (let i = 0; i < this.cells.length; i += this.cols.length) {
      rows.push(this.cells.slice(i, i + this.cols.length));
    }
    return rows;
  };

  isNearBorder(event: MouseEvent, cell: HTMLElement): boolean {
    const borderThreshold = 3;
    const rect = cell.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const nearBorder = mouseX > rect.right - borderThreshold; // Right side
    // mouseY < rect.top + borderThreshold ||    // Top side
    // mouseY > rect.bottom - borderThreshold;   // Bottom side
    return nearBorder;
  }
  // When the mouse is pressed down, initiate resizing
  onMouseDown(e: any, col_index: number) {
    const event: MouseEvent & { target: HTMLElement } = e;
    if (event.target === event.currentTarget) {
      this.resize_col_index = col_index;
      const th = event.target.closest('th');
      if (!!th) {
        const is_near_border = this.isNearBorder(event, th);
        if (is_near_border) {
          document.body.style.cursor = `ew-resize`;
          this.cell_el = th;
        } else {
          this.cell_el = undefined;
        }
      }

      event.preventDefault(); // Prevent text selection
    }
  }

  prev_selected_cell_id: number = -1;
  is_selecting = false;

  selected_cell_ids: number[] = [];

  onMouseMoveCell(id: number): void {
    if (this.prev_selected_cell_id != id && this.is_selecting) {
      let selected_cell_ids = [
        ...this.cells.filter((p) => p.is_selected == true).map((p) => p.id),
      ];

      const i = selected_cell_ids.findIndex((p) => p == id);

      selected_cell_ids.push(id);

      if (i !== -1) {
        //if existing remove all remove all id in the same column and rows to the last selected
        const cell_index_to_remove = selected_cell_ids.findIndex(
          (p) => p == this.prev_selected_cell_id
        );

        const cell_index_to_add = selected_cell_ids.findIndex((p) => p == id);

        const cell_to_remove = selected_cell_ids[cell_index_to_remove];
        const cell_to_add = selected_cell_ids[cell_index_to_add];

        const cell_col_to_remove =
          this.cells.find((p) => p.id == cell_to_remove)?.column ?? -1;
        const cell_row_to_remove =
          this.cells.find((p) => p.id == cell_to_remove)?.row ?? -1;

        const cell_col_to_add =
          this.cells.find((p) => p.id == cell_to_add)?.column ?? -1;

        const cell_row_to_add =
          this.cells.find((p) => p.id == cell_to_add)?.row ?? -1;

        let remove_row_indexes: number[] = [];

        for (let i = 0; i < selected_cell_ids.length; i++) {
          //check if same column
          let cell = this.cells.find((p) => p.id == selected_cell_ids[i]);

          if (cell_col_to_add != cell_col_to_remove) {
            if (cell?.column == cell_col_to_remove) {
              remove_row_indexes.push(i);
            }
          }
        }

        selected_cell_ids = selected_cell_ids.filter(
          (_, index) => !remove_row_indexes.includes(index)
        );

        selected_cell_ids = [...new Set(selected_cell_ids)];

        remove_row_indexes = [];

        for (let i = 0; i < selected_cell_ids.length; i++) {
          //check if same column
          let cell = this.cells.find((p) => p.id == selected_cell_ids[i]);

          if (cell_row_to_add != cell_row_to_remove) {
            if (cell?.row == cell_row_to_remove) {
              // console.log(`cell_row_to_remove`, cell_row_to_remove);
              remove_row_indexes.push(i);
            }
          }
        }

        selected_cell_ids = selected_cell_ids.filter(
          (_, index) => !remove_row_indexes.includes(index)
        );
      }

      this.selected_cell_ids = [...new Set(selected_cell_ids)].sort(
        (a, b) => a - b
      );

      const selected_cells = this.cells.filter((p) =>
        this.selected_cell_ids.includes(p.id)
      );

      const max_col = selected_cells.reduce(
        (max, obj) => (obj.column > max.column ? obj : max),
        selected_cells[0]
      ).column;

      const min_col = selected_cells.reduce(
        (min, obj) => (obj.column < min.column ? obj : min),
        selected_cells[0]
      ).column;

      const max_id = selected_cells.reduce(
        (max, obj) => (obj.id > max.id ? obj : max),
        selected_cells[0]
      ).id;

      const min_id = selected_cells.reduce(
        (min, obj) => (obj.id < min.id ? obj : min),
        selected_cells[0]
      ).id;

      const min_row = this.cells.find((c) => c.id == min_id)?.row ?? -1;
      const max_row = this.cells.find((c) => c.id == max_id)?.row ?? -1;

      this.cells.forEach((p) => (p.is_selected = false));

      for (let r = min_row; r <= max_row; r++) {
        for (let c = min_col; c <= max_col; c++) {
          const index = this.cells.findIndex(
            (p) => p.row == r && p.column == c
          );
          this.cells[index].is_selected = true;
        }
      }

      /*
      const rows = this.getRows();

      const min_row = rows.findIndex(
        (r) => r.findIndex((c) => c.id == min_id) !== -1
      );
      const max_row = rows.findIndex(
        (r) => r.findIndex((c) => c.id == max_id) !== -1
      );

      this.cells.forEach((p) => (p.is_selected = false));

      //apply new selection
      for (let r = min_row; r <= max_row; r++) {
        for (let c = min_col; c <= max_col; c++) {
          const select_id = rows[r][c].id;
          const index = this.cells.findIndex((p) => p.id == select_id);
          this.cells[index].is_selected = true;
        }
      }

      */
      this.prev_selected_cell_id = id;
    }
  }

  onMouseLeaveCell = (id: number) => {
    if (this.is_selecting) {
    }
  };

  onMouseDownRows(e: any, id: number) {
    const event: MouseEvent & { target: HTMLElement } = e;

    if (event.target === event.currentTarget) {
      const td = event.target.closest('td');

      if (!!td) {
        // this.rows[row_index][cell_index].is_selected = true;
        this.onBeginSelect(id);
      }

      event.preventDefault(); // Prevent text selection
    }
  }

  onBeginSelect = (id: number) => {
    this.is_selecting = false;
    this.selected_cell_ids = [];

    this.cells.forEach((p) => {
      if (p.id == id) {
        p.is_selected = true;
        this.is_selecting = true;
        // this.selected_cell_id.push(id);
      } else {
        p.is_selected = false;
      }
    });

    // if (this.first_selected_cell_id != id) {
    //   this.first_selected_cell_id = -1;

    //   this.cells.forEach((p) => {
    //     if (p.id == id) {
    //       p.is_selected = true;
    //       this.first_selected_cell_id = id;
    //       this.is_selecting = true;
    //       this.selected_cell_id.push(id);
    //     } else {
    //       p.is_selected = false;
    //     }
    //   });
    // } else {
    //   this.cells.forEach((p) => {
    //     p.is_selected = false;
    //   });
    //   this.first_selected_cell_id = -1;
    // }
  };

  // Stop resizing when the mouse is released
  @HostListener('document:mouseup')
  onMouseUp() {
    this.resize_col_index = -1;
    // this.first_selected_cell_id = -1;
    this.is_selecting = false;
    this.selected_cell_ids = [];

    document.body.style.cursor = `unset`;
  }

  // Update the width of the div as the mouse moves
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent & { target: HTMLElement }) {
    const td = event.target?.closest('td');
    const th = event.target?.closest('th');

    if (!!th && this.resize_col_index == -1) {
      const near = this.isNearBorder(event, th);
      if (near) {
        document.body.style.cursor = `ew-resize`;
      } else {
        document.body.style.cursor = `unset`;
      }
    }

    if (this.resize_col_index != -1) {
      if (!this.cell_el) return;

      const rect = this.cell_el.getBoundingClientRect();

      let width = event.clientX - rect.x;

      this.cols[this.resize_col_index].width = width;
    }
  }
}

interface ITableCol {
  id: number;
  width: number;
  height: number;
}

interface ITableCell {
  id: number;
  column: number;
  row: number;
  width: number;
  height: number;
  row_span: number;
  col_span: number;
  is_selected: boolean;
  is_hidden?: boolean;
}

interface ILastSelectedCell {
  ri: number;
  ci: number;
}
