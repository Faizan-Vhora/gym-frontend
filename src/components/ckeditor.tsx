'use client';

import * as React from 'react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

interface CustomEditorProps {
  data: string;
  onChange: (data: string) => void;
}

const ckEditorConfig = {
  shouldNotGroupWhenFull: true,
  toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
  placeholder: 'Type your content here...',  // Add the placeholder text here
};

function CustomEditor({ data, onChange }: CustomEditorProps) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={data}
      onChange={(event, editor) => {
        const editorData = editor.getData();
        onChange(editorData);
      }}
      config={ckEditorConfig}
    />
  );
}

export default CustomEditor;
