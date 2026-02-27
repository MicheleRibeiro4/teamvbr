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
            box-sizing: border-box;
            background: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: black;
            display: block;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .pdf-page-landscape {
            width: 1123px;
            box-sizing: border-box;
            background: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: black;
            display: block;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .pdf-page + .pdf-page,
          .pdf-page-landscape + .pdf-page-landscape,
          .pdf-page + .pdf-page-landscape,
          .pdf-page-landscape + .pdf-page {
            page-break-before: always;
            break-before: page;
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
