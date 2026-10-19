param([long]$WindowHandle, [int]$ParentProcessId)
Add-Type -AssemblyName System.Windows.Forms
Add-Type -ReferencedAssemblies System.Windows.Forms -TypeDefinition @'
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Forms;
public static class CabanonWindowsKey {
    delegate IntPtr Hook(int code, IntPtr message, IntPtr data);
    static Hook callback = OnKey;
    static IntPtr hook, window;
    static bool left, right;
    [DllImport("user32.dll")] static extern IntPtr SetWindowsHookEx(int id, Hook fn, IntPtr module, uint thread);
    [DllImport("user32.dll")] static extern bool UnhookWindowsHookEx(IntPtr handle);
    [DllImport("user32.dll")] static extern IntPtr CallNextHookEx(IntPtr handle, int code, IntPtr message, IntPtr data);
    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
    [DllImport("kernel32.dll", CharSet=CharSet.Auto)] static extern IntPtr GetModuleHandle(string name);
    static void Emit(string value) { Console.WriteLine(value); Console.Out.Flush(); }
    static IntPtr OnKey(int code, IntPtr message, IntPtr data) {
        if (code < 0) return CallNextHookEx(hook, code, message, data);
        int key=Marshal.ReadInt32(data), msg=message.ToInt32();
        bool down=msg==0x100||msg==0x104, up=msg==0x101||msg==0x105;
        bool winKey=key==0x5B||key==0x5C;
        if (!winKey) return CallNextHookEx(hook,code,message,data);
        bool held=key==0x5B?left:right;
        if (down && GetForegroundWindow()==window) {
            if(!held) Emit("FROM_DOWN");
            if(key==0x5B) left=true; else right=true;
            return new IntPtr(1);
        }
        if(up && held) {
            if(key==0x5B) left=false; else right=false;
            if(!left&&!right) Emit("FROM_UP");
            return new IntPtr(1);
        }
        return CallNextHookEx(hook,code,message,data);
    }
    public static void Run(long handle, int parent) {
        window=new IntPtr(handle);
        hook=SetWindowsHookEx(13,callback,GetModuleHandle(null),0);
        if(hook==IntPtr.Zero) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
        var timer=new Timer(); timer.Interval=1000;
        timer.Tick+=(sender,args)=>{try{if(Process.GetProcessById(parent).HasExited)Application.ExitThread();}catch{Application.ExitThread();}};
        timer.Start();Console.WriteLine("READY");Console.Out.Flush();
        try { Application.Run(); } finally { timer.Dispose();UnhookWindowsHookEx(hook); }
    }
}
'@
[CabanonWindowsKey]::Run($WindowHandle, $ParentProcessId)
