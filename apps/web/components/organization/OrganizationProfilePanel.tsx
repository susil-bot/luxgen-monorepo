export function OrganizationProfilePanel({open,onClose}:{open:boolean;onClose:()=>void}){if(!open)return null;return <div role='dialog'><button type='button' onClick={onClose}>Close</button></div>;}
