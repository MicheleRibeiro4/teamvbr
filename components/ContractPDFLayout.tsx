import React from 'react';

interface Props {
  children: React.ReactNode;
}

const ContractPDFLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="bg-white print:bg-transparent w-[794px]" style={{ margin: 0, padding: 0, display: 'block' }}>
      <style>
        {`
          .pdf-page {
            width: 794px;
            min-height: 1123px;
            box-sizing: border-box;
            background: white;
            position: relative;
            color: black;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            text-align: justify;
            display: block;
            page-break-after: always;
          }
          .pdf-page:last-child {
            page-break-after: auto;
          }
          .break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          * {
            box-sizing: border-box;
          }
        `}
      </style>
      {children}
    </div>
  );
};

export default ContractPDFLayout;
