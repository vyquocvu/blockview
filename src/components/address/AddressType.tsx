import { useEffect, useState } from "react";
import { Contract } from 'sevm';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { provider } from "../../lib/blockchain";
import { formatAddress } from "../../lib/format";
import { Button } from "../ui/button";
import 'sevm/4bytedb';
import { ethers } from "ethers";

interface AddressTypeProps {
  isContract: boolean;
  address?: string;
}

interface ContractFunction {
  name: string;
  type: 'read' | 'write';
  inputs: Array<{ name: string; type: string }>;
  outputs?: Array<{ name: string; type: string }>;
}

export function AddressType({ isContract, address }: AddressTypeProps) {
  const [contractCreator] = useState<string | null>(null);
  const [creationTx] = useState<string | null>(null);
  const [contractCode, setContractCode] = useState<string | null>(null);
  const [opcodes, setOpcodes] = useState<string | null>(null);
  const [readable, setReadable] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'bytecode' | 'opcodes' | 'solidity' | 'interface'>('bytecode');
  const [isFullView, setFullView] = useState<boolean>(false);

  const [functions, setFunctions] = useState<ContractFunction[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [functionInputs, setFunctionInputs] = useState<Record<string, Record<string, string>>>({});
  const [functionResults, setFunctionResults] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState<Record<string, boolean>>({});
  const [executionError, setExecutionError] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchContractInfo = async () => {
      if (!isContract || !address) return;
      try {
        setLoading(true);
        setError(null);

      } catch (err) {
        console.error("Error fetching contract information:", err);
        setError("Failed to fetch contract information");
      } finally {
        setLoading(false);
      }
    };

    if (isContract && address) {
      fetchContractInfo();
      // get Code
      provider.getCode(address).then((code) => {
        const contract = new Contract(code).patchdb(); // Lookup for 4byte matches
        const opcodes = contract.opcodes();
        const opcodesString = opcodes.map(opcode => opcode.format()).join('\n');

        // Parse contract interface
        const parsedFunctions: ContractFunction[] = contract.getFunctions().map(func => {
          const [name, inputs] = func.split('(');
          const inputParams = inputs.slice(0, -1).split(',').filter(Boolean).map(param => {
            const [type, name] = param.trim().split(' ');
            return { name: name || 'param', type };
          });
          return {
            name,
            type: name.startsWith('view_') || name.startsWith('pure_') ? 'read' : 'write',
            inputs: inputParams
          };
        });
        const parsedEvents = contract.getEvents()

        setContractCode(code);
        setOpcodes(opcodesString);
        setReadable(contract.solidify().toString());
        setFunctions(parsedFunctions);
        setEvents(parsedEvents);
      });
    }
  }, [isContract, address]);

  const handleInputChange = (funcName: string, paramName: string, value: string) => {
    setFunctionInputs(prev => ({
      ...prev,
      [funcName]: { ...(prev[funcName] || {}), [paramName]: value }
    }));
  };

  const executeFunction = async (func: ContractFunction) => {
    console.log('Executing function:', func);
    if (!address) return;

    setExecuting(prev => ({ ...prev, [func.name]: true }));
    setExecutionError(prev => ({ ...prev, [func.name]: '' }));

    try {
      const inputs = func.inputs.map(input =>
        functionInputs[func.name]?.[input.name] || '');
      if (func.type === 'read') {
        const contract = new ethers.Contract(address, func.inputs.map(i => i.type), provider);
        const result = await contract[func.name](...inputs);
        setFunctionResults(prev => ({ ...prev, [func.name]: result.toString() }));
      } else {
        // For write functions, we'll need to implement transaction signing
        // This will require wallet connection and transaction confirmation
        setFunctionResults(prev => ({ ...prev, [func.name]: 'Transaction required' }));
      }
    } catch (err) {
      setExecutionError(prev => ({ 
        ...prev, 
        [func.name]: err instanceof Error ? err.message : 'Execution failed'
      }));
    } finally {
      setExecuting(prev => ({ ...prev, [func.name]: false }));
    }
  };

  const renderInterface = () => {
    const readFunctions = functions.filter(f => f.type === 'read');
    const writeFunctions = functions.filter(f => f.type === 'write');

    return (
      <div className="space-y-1">
        <div>
          <h4 className="text-sm font-semibold mb-3">Read Contract</h4>
          <div className="space-y-4">
            {readFunctions.map((func, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-primary">
                    {func.name}
                  </span>
                </div>
                {func.inputs.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {func.inputs.map((input, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder={`${input.name} (${input.type})`}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={functionInputs[func.name]?.[input.name] || ''}
                          onChange={(e) => handleInputChange(func.name, input.name, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    onClick={() => executeFunction(func)}
                    disabled={executing[func.name]}
                  >
                    {executing[func.name] ? 'Reading...' : 'Query'}
                  </Button>
                  {functionResults[func.name] && (
                    <div className="text-sm font-mono">
                      Result: {functionResults[func.name]}
                    </div>
                  )}
                  {executionError[func.name] && (
                    <div className="text-sm text-destructive">
                      {executionError[func.name]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Write Contract</h4>
          <div className="space-y-4">
            {writeFunctions.map((func, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-primary">
                    {func.name}
                  </span>
                </div>
                {func.inputs.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {func.inputs.map((input, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder={`${input.name} (${input.type})`}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={functionInputs[func.name]?.[input.name] || ''}
                          onChange={(e) => handleInputChange(func.name, input.name, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    onClick={() => executeFunction(func)}
                    disabled={executing[func.name]}
                  >
                    {executing[func.name] ? 'Writing...' : 'Write'}
                  </Button>
                  {executionError[func.name] && (
                    <div className="text-sm text-destructive">
                      {executionError[func.name]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Events</h4>
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={index} className="p-2 bg-muted/50 rounded-md">
                <div className="text-xs font-mono">{event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex">
        <h3 className="text-sm w-28 font-medium text-muted-foreground">Type</h3>
        <p className="text-sm">{isContract ? "Contract" : "Externally Owned Account (EOA)"}</p>
      </div>

      {isContract && (
        <Card className="mt-6 relative">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Contract Information</CardTitle>
          </CardHeader>
          <CardContent className={isFullView ? 'fixed inset-0 z-50 bg-background pt-8' : ''}>
            <div className={isFullView ? "h-full" : "grid gap-1"}>
              <div className="flex">
                <h3 className="text-sm w-40 text-left font-medium text-muted-foreground">Contract Creator</h3>
                {loading ? (
                  <p className="text-sm">Loading...</p>
                ) : error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : contractCreator ? (
                  <p className="text-sm font-mono">
                    <a href={`#/address/${contractCreator}`} className="text-primary hover:underline">
                      {contractCreator}
                    </a>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not available</p>
                )}
              </div>
              <div className="flex">
                <h3 className="text-sm w-40 text-left font-medium text-muted-foreground">Creation Transaction</h3>
                {loading ? (
                  <p className="text-sm">Loading...</p>
                ) : error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : creationTx ? (
                  <p className="text-sm font-mono">
                    <a href={`#/tx/${creationTx}`} className="text-primary hover:underline">
                      {formatAddress(creationTx)}
                    </a>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not available</p>
                )}
              </div>
              {
                contractCode && (
                  <div className="text-left h-[calc(100%-54px)] flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 absolute top-2 right-2"
                      onClick={() => setFullView(!isFullView)}
                    >
                      {isFullView ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="4 14 10 14 10 20" />
                          <polyline points="20 10 14 10 14 4" />
                          <line x1="14" y1="10" x2="21" y2="3" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                      )}
                    </Button>
                    <div className="flex justify-between items-center pb-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Contract Code</h3>
                      <div className="space-x-2">
                        <Button
                          variant={viewMode === 'bytecode' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('bytecode')}
                        >
                          Bytecode
                        </Button>
                        <Button
                          variant={viewMode === 'opcodes' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('opcodes')}
                        >
                          Opcodes
                        </Button>
                        <Button
                          variant={viewMode === 'solidity' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('solidity')}
                        >
                          Solidity
                        </Button>
                        <Button
                          variant={viewMode === 'interface' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('interface')}
                        >
                          Interface
                        </Button>
                      </div>
                    </div>
                    <div className="relative h-full">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2 h-6 w-6"
                        onClick={() => {
                          const content = viewMode === 'bytecode' ? contractCode : opcodes;
                          navigator.clipboard.writeText(content || '');
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      </Button>
                      <pre className={`text-xs rounded-md bg-muted overflow-auto p-3 text-left font-mono break-all whitespace-pre-wrap ${isFullView ? 'h-[calc(100vh-8rem)]' : 'h-[20pc]'}`}>
                        {viewMode === 'bytecode' ? contractCode : '' }
                        {viewMode === 'opcodes' ? opcodes : '' }
                        {viewMode === 'solidity' ? readable : ''}
                        {viewMode === 'interface' ? renderInterface() : ''}
                      </pre>
                    </div>
                  </div>
                )
              }
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}