export interface SubTodo {
  id: string;
  todo_id: string;
  title: string;
  is_done: boolean;
  step_order: number;
  is_timer_running: boolean;
  timer_elapsed_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  is_main_timer_running: boolean;
  main_timer_elapsed_seconds: number;
  created_at: string;
  updated_at: string;
  sub_todos?: SubTodo[];
}

export interface TodoWithSubTodos extends Todo {
  sub_todos: SubTodo[];
}
