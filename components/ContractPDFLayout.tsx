import React from 'react';

interface Props {
  children: React.ReactNode;
  width?: string;
}

const ContractPDFLayout: React.FC<Props> = ({ children, width = '794px' }) => {
  return (
    <div
      style={{
        width: width,
        margin: 0,
        padding: 0,
        background: '#ffffff'
      }}
    >
      <style>
        {`
          .pdf-page {
            width: 794px;
            min-height: 1123px;
            box-sizing: border-box;
            background: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: black;
            display: block;
            page-break-after: always;
            break-after: page;
          }

          .pdf-page-landscape {
            width: 1123px;
            min-height: 794px;
            box-sizing: border-box;
            background: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: black;
            display: block;
            page-break-after: always;
            break-after: page;
          }

          .pdf-page:last-child,
          .pdf-page-landscape:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          p,
          table,
          tr,
          .section,
          .card,
          .signature-block,
          .clause-title,
          .clause-text {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .clause-title {
            font-weight: bold;
            margin: 0;
            padding: 0;
            text-indent: 0;
          }

          .clause-text {
            margin: 0;
            padding: 0;
            text-indent: 0;
            text-align: justify;
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
