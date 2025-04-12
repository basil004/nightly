import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

const CustomEditor = ({ value, onChange }) => {
    return (
        <Editor
            apiKey='uc2vff3zu3uzq2bp80f4gepnsvzxu9wcbi2hgrgkrzh2imhy' // Replace with your actual TinyMCE API key
            initialValue={value}
            init={{
                height: 500,
                menubar: false,
                plugins: [
                    'advlist autolink lists link image charmap preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table code help wordcount'
                ],
                toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
            onEditorChange={(newValue) => {
                onChange(newValue); // Call the onChange prop to update the content
            }}
        />
    );
};

export default CustomEditor;
