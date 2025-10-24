import React from 'react';

export interface ChipProps {
    label : string;
    variant : 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    size : 'small' | 'medium' | 'large';
    shape : 'rounded' | 'pill' | 'square';
    closable : boolean;
    onClose : () => void;
    icon : React.ReactNode;
    maxWidth : string | number;
    tenantTheme : TenantTheme;
    className : string;
    style : React.CSSProperties;
}

export const Chip: React.FC<ChipProps> = (props) => {
    
}