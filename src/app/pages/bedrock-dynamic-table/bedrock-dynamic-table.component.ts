import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-bedrock-dynamic-table',
  templateUrl: './bedrock-dynamic-table.component.html',
  styleUrls: ['./bedrock-dynamic-table.component.scss'],
})
export class BedrockDynamicTableComponent {
  width = 100; // Initial width of the div
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
        width: this.width,
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
          width: this.width,
          // height: 30,
          row_span: 1,
          col_span: 1,
          is_selected: false,
          is_hidden: false,
          data_field: ``,
          is_read_only: true,
          value: `${x} - ${i}`,
          align: `left`,
          vAlign: `top`,
        };
        this.cells.push(cell);

        id++;
      }
    }
  };

  onRightClick(event: MouseEvent): void {
    event.preventDefault(); // Prevent the default context menu from appearing
    console.log('Right-click detected at:', event.clientX, event.clientY);
    // Perform any other action, such as showing a custom menu
  }

  onMergeCell = () => {
    const selected_cells = this.cells.filter((p) => p.is_selected == true);

    if (selected_cells.length <= 0) return;

    const columns = [...new Set(selected_cells.map((p) => p.column))];
    const rows = [...new Set(selected_cells.map((p) => p.row))];

    const min_col = Math.min(...columns);
    const max_col = Math.max(...columns);
    const min_row = Math.min(...rows);
    const max_row = Math.max(...rows);

    this.unmergeCellsInRange(min_row, min_col, max_row, max_col);

    const row_span = max_row - min_row + 1;
    const cols_span = max_col - min_col + 1;

    const row_span_index = this.cells.findIndex(
      (p) => p.row == min_row && p.column == min_col
    );

    this.cells[row_span_index].row_span = row_span;
    this.cells[row_span_index].col_span = cols_span;

    for (let i = min_row; i <= max_row; i++) {
      for (let j = min_col; j <= max_col; j++) {
        if (i !== min_row || j !== min_col) {
          const index = this.cells.findIndex(
            (p) => p.row == i && p.column == j
          );
          this.cells[index].is_hidden = true;
        }
      }
    }

    this.cells.forEach((p) => (p.is_selected = false));
    this.selected_cell_ids = [];
  };

  onSplitCell = () => {
    const selected_cells = this.cells.filter((p) => p.is_selected == true);

    if (selected_cells.length <= 0) return;

    const columns = [...new Set(selected_cells.map((p) => p.column))];
    const rows = [...new Set(selected_cells.map((p) => p.row))];

    const min_col = Math.min(...columns);
    const max_col = Math.max(...columns);
    const min_row = Math.min(...rows);
    const max_row = Math.max(...rows);

    this.unmergeCellsInRange(min_row, min_col, max_row, max_col);

    this.cells.forEach((p) => (p.is_selected = false));
    this.selected_cell_ids = [];
  };

  unmergeCellsInRange(
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ): void {
    const mergedCells = this.getMergedCellsInRange(
      startRow,
      startCol,
      endRow,
      endCol
    );

    mergedCells.forEach((id) => {
      const cell = this.cells.find((p) => p.id == id);

      if (!!cell) {
        const rowspan = cell?.row_span;
        const colspan = cell?.col_span;

        // Reset the merged cell
        cell.row_span = 1;
        cell.col_span = 1;

        // Unhide and restore values of previously hidden cells
        for (let i = cell.row; i < cell.row + rowspan; i++) {
          for (let j = cell.column; j < cell.column + colspan; j++) {
            if (i !== cell.row || j !== cell.column) {
              const index = this.cells.findIndex(
                (p) => p.row == i && p.column == j
              );

              this.cells[index].is_hidden = false;
              // this.tableData[i][j].hidden = false;
              // this.tableData[i][j].value = this.tableData[i][j].originalValue;
            }
          }
        }
      }
    });
  }

  getMergedCellsInRange(
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ): number[] {
    const table: Array<ITableCell[]> = [];

    const mergedCells: number[] = [];

    for (let y = 0; y < this.rows.length; y++) {
      const columns = this.cells.filter((c) => c.row == y);
      table.push(columns);
    }

    for (let i = 0; i < table.length; i++) {
      for (let j = 0; j < table[i].length; j++) {
        const cell = table[i][j];
        if (!cell.is_hidden && (cell.row_span > 1 || cell.col_span > 1)) {
          // Check if this merged cell overlaps with the selection
          const cellEndRow = i + cell.row_span - 1;
          const cellEndCol = j + cell.col_span - 1;

          if (
            !(
              cellEndRow < startRow ||
              i > endRow ||
              cellEndCol < startCol ||
              j > endCol
            )
          ) {
            mergedCells.push(cell.id);
          }
        }
      }
    }

    // for (let i = 0; i < this.cells.length; i++) {
    //   const cell = this.cells[i];

    //   if (cell.is_hidden != true && (cell.row_span > 1 || cell.col_span > 1)) {
    //     const cellEndRow = cell.row + cell.row_span - 1;
    //     const cellEndCol = cell.column + cell.col_span - 1;

    //     if (
    //       !(
    //         cellEndRow < startRow ||
    //         i > endRow ||
    //         cellEndCol < startCol ||
    //         cell.column > endCol
    //       )
    //     ) {
    //       // mergedCells.push({ row: cell.row, col: cell.column });
    //       mergedCells.push(cell.id);
    //     }
    //   }
    // }

    return mergedCells;
  }

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
      const found = i !== -1;

      //add the new selected id to the array
      selected_cell_ids.push(id);
      if (found) {
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
      }
      // event.preventDefault(); // Prevent text selection
    }
  }

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

  //text inputs

  onDoubleClick = (event: Event) => {
    const target = event.target as HTMLInputElement;

    target.focus();
  };

  onInputMouseDown = (event: Event, cell_id: number) => {
    this.onMouseDownRows(event, cell_id);

    if (this.editing_cell_id != cell_id) {
      event.preventDefault();
    } else {
    }
  };

  onInputFocus = (event: Event, cell_id: number) => {
    const target = event.target as HTMLInputElement;

    event.preventDefault();

    if (event.target === event.currentTarget) {
      const td = target.closest('td');

      if (!!td) {
        target.style.border = `1px solid blue`;

        this.editing_cell_id = cell_id;

        console.log(`this.editing_cell_id `, this.editing_cell_id);
      }
    }
  };

  onInputBlur = (event: Event, cell_index: number) => {
    const target = event.target as HTMLInputElement;
    const td = target.closest('td');

    if (!!td) {
      // td.style.border = `1px solid black`;

      // if (cell_index == this.cells.length - 1) {
      //   this.editing_cell_id = this.cells[0].id;
      //   const table = target.closest('table');

      //   const first_cell = table?.querySelector(`td`);

      //   if (!!first_cell) {
      //     first_cell.style.border = `1px solid blue`;
      //   }
      // } else {
      // }

      target.style.border = `1px solid transparent`;
      this.editing_cell_id = -1;

      // event.preventDefault();
    }
  };

  getTextColCount = (value: string) => {
    const split = value.split('\n');

    const lengths = split.map((p) => p.length);

    const max = Math.max(...lengths);

    return max > 0 ? max : 1;
    // return split[0].length > 0 ? split[0].length : 1;
  };

  getTextRowCount = (value: string) => {
    const split = value.split('\n');

    return split.length;
  };

  editing_cell_id = -1;

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reset height to allow shrinking

    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  getTable = () => {
    console.log(this.cells);
  };
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
  // height: number;
  row_span: number;
  col_span: number;
  is_selected: boolean;
  is_hidden: boolean;
  //
  data_field: string;
  is_read_only: boolean;
  value: string;
  align: `left` | `center` | `right`;
  vAlign: `top` | `middle` | `bottom`;
}

interface ILastSelectedCell {
  ri: number;
  ci: number;
}
