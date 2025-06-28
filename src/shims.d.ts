// Minimal module declarations to satisfy TypeScript when node_modules are absent

declare module 'react' {
  export const useState: any
  export const useEffect: any
  export const useContext: any
  export const createContext: any
  export function forwardRef<T, P>(fn: any): any
  export const isValidElement: any
  export const cloneElement: any
  export const Fragment: any
  export const StrictMode: any
  export type ReactNode = any
  export interface HTMLAttributes<T> { [key: string]: any }
  export interface InputHTMLAttributes<T> { [key: string]: any }
  export interface TextareaHTMLAttributes<T> { [key: string]: any }
  export interface SVGProps<T> { [key: string]: any }
  export interface ComponentPropsWithoutRef<T> { [key: string]: any }
  export type ElementRef<T> = any
}

declare module 'react-dom/client' {
  export const createRoot: any
}

declare module 'react/jsx-runtime' {
  export const jsx: any
  export const jsxs: any
  export const Fragment: any
}

declare module 'ethers' {
  export const ethers: any
  export const BrowserProvider: any
  export type BrowserProvider = any
  export const JsonRpcProvider: any
  export type JsonRpcProvider = any
  export const Contract: any
  export function formatEther(value: any): any
  export function formatUnits(value: any, decimals?: number): any
}

declare module 'lucide-react' {
  export const X: any
  export const Check: any
  export const ChevronDown: any
  export const ChevronUp: any
}

declare module 'class-variance-authority' {
  export function cva(...args: any[]): any
  export default function cva(...args: any[]): any
}

declare module 'clsx' {
  export const clsx: (...args: any[]) => string
  export type ClassValue = any
  export default clsx
}

declare module 'tailwind-merge' {
  export function twMerge(...args: any[]): string
}

declare module '@radix-ui/react-dialog' {
  export const Root: any
  export const Trigger: any
  export const Portal: any
  export const Close: any
  export const Overlay: any
  export const Content: any
}

declare module '@radix-ui/react-label' {
  export const Root: any
}

declare module '@radix-ui/react-select' {
  export const Root: any
  export const Group: any
  export const Value: any
  export const Trigger: any
  export const Icon: any
  export const ScrollUpButton: any
  export const ScrollDownButton: any
  export const Portal: any
  export const Content: any
  export const Viewport: any
  export const Item: any
  export const ItemText: any
  export const ItemIndicator: any
  export const Label: any
  export const Separator: any
}

declare module '@radix-ui/react-slot' {
  export const Slot: any
}

declare module '@radix-ui/react-switch' {
  export const Root: any
  export const Thumb: any
}

declare module '@radix-ui/react-tabs' {
  export const Root: any
  export const List: any
  export const Trigger: any
  export const Content: any
}

declare module '*.css'
