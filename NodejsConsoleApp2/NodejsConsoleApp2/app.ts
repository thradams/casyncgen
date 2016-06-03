



var bEnableLines = false;
var lineBase = 0;
var sourceFileName = "";


function GetLambdaName(call: Call, name: string): string {
    var s = name;
    s += "_Lambda" + call.id;
    return s;
}


function GetCaptureName(call: Call, name: string): string {
    var s = name;
    s += "_Capture" + call.id;
    return s;
}

interface TypeAndName {
    name: string;
    type: string;
}

class Call {
    name: string;
    id: number;
    call: string;
    lines0: string;
    currentLine0: number;
    lines1: string;
    currentLine1: number;
    args: Array<TypeAndName>;
    captures: Array<TypeAndName>;
    static staticid: number = 0;

    constructor() {
        this.id = Call.staticid;
        Call.staticid++;

        this.name = "";
        this.call = "";
        this.lines0 = "";
        this.currentLine0 = 0;
        this.lines1 = "";
        this.currentLine1 = 0;
        this.args = new Array<TypeAndName>();
        this.captures = new Array<TypeAndName>();
    }
}

class Source {
    firstCall: Call;
    calls: Array<Call>;

    constructor() {
        this.firstCall = new Call();
        this.calls = new Array<Call>();
    }
}

function GenerateLines(indentation: number,
    lineNumber: number,
    lines: string) {
    var s = "";
    s += "//USER CODE====================\n";
    var ar = lines.split('\n');
    for (var i = 0; i < ar.length; i++) {
        var tline = ar[i].trim();
        if (bEnableLines && tline != "") {
            s += "#line " + (lineBase + lineNumber);
            if (sourceFileName) {
                s += " \"" + sourceFileName + "\"";
            }

            s += "\n";
        }
        s += Ident(indentation) + ar[i].trim();
        s += '\n';
        lineNumber++;
    }

    s += "//USER CODE====================\n";

    return s;
}

function GenerateTargetTypeVar(target: Call) {
    var s = "";
    s += "void (*onResult)(Result";
    for (var i = 0; i < target.args.length; i++) {
        s += ", ";
        s += target.args[i].type;
    }
    s += ", void*)";

    return s;
}

function GenerateTargetErrorCall(target: Call) {
    var s = "";

    s += "onResult(result";
    for (var i = 0; i < target.args.length; i++) {
        s += ", ";
        s += "NULL";
    }
    s += ", data);//target error call\n";
    return s;
}

function SameSizeOf(sInput: string) {
    var s = "";
    for (var i = 0; i < sInput.length; i++) {
        s += " ";
    }
    return s;
}

function Ident(n: number) {
    var s = "";
    for (var i = 0; i < n; i++) {
        s += "    ";
    }
    return s;
}
function GenerateArguments(spaces: string, items: Array<TypeAndName>) {
    var s = "";
    for (var i = 0; i < items.length; i++) {
        s += items[i].type + " " + items[i].name;
        if (i < items.length - 1) {
            s += ",\n" + spaces;
        }
    }
    return s;
}

function GenerateCaptureNames(items: Array<TypeAndName>) {
    var s = "";
    for (var i = 0; i < items.length; i++) {
        s += items[i].name;
        if (i < items.length - 1) {
            s += ", ";
        }
    }
    return s;
}
function GenerateCapture(identation: number, info: Call, source: Source) {
    var name0 = info.name;
    var captures = info.captures;
    var name = GetCaptureName(info, name0);
    var ErrorType = "Result";

    var s = "";

    //declara struct
    s += "typedef struct \n";// + name + "\n";
    s += "{\n";
    for (var i = 0; i < captures.length; i++) {
        s += Ident(identation + 1) + captures[i].type + " " + captures[i].name + ";\n";
    }

    s += Ident(identation + 1) + GenerateTargetTypeVar(source.firstCall) + ";\n";
    s += Ident(identation + 1) + "void* data;\n";


    s += "} " + name + ";\n";

    var spaces = SameSizeOf("static " + ErrorType + " " + name + "_Init(");

    //implementa init
    s += "\n";
    var captureStr = GenerateArguments(spaces, captures);
    if (captureStr != "") {
        captureStr += ",\n" + spaces;
    }
    s += "static " + ErrorType + " " + name + "_Init(" + name + "** pp,\n" + spaces + captureStr + GenerateTargetTypeVar(source.firstCall) + ",\n" + spaces + "void* data" + ")\n";
    s += "{\n";
    s += Ident(identation + 1) + "Result result;\n";
    s += Ident(identation + 1) + "" + name + " *p = " + "(" + name + "*)" + "malloc(sizeof(" + "" + name + "));\n"
    s += Ident(identation + 1) + "result = p ? RESULT_OK : RESULT_OUTOFMEM;\n";
    s += Ident(identation + 1) + "if (result == RESULT_OK)\n";
    s += Ident(identation + 1) + "{\n";
    //implementa copias do init
    for (var i = 0; i < captures.length; i++) {
        s += Ident(identation + 2) + "p->" + captures[i].name + " = _strdup(" + captures[i].name + ");\n";
    }

    s += Ident(identation + 2) + "p->onResult = onResult;\n";
    s += Ident(identation + 2) + "p->data = data;\n";
    s += Ident(identation + 2) + "*pp = p;\n";
    s += Ident(identation + 1) + "}\n";

    s += Ident(identation + 1) + "return result;\n";
    s += "}\n";

    ////////


    //implementa destroy
    s += "\n";
    s += "static void" + " " + name + "_Destroy(" + name + "* p)\n";
    s += "{\n";

    for (var i = 0; i < captures.length; i++) {
        s += Ident(identation + 1) + "free((void*)p->" + captures[i].name + ");\n";
    }
    s += "}\n\n";


    return s;
};

function GenerateCaptureLocal(call: Call,
    captures: Array<TypeAndName>,
    source: Source) {
    var name0 = call.name;
    var name = GetCaptureName(call, name0);

    var ErrorType = "Result";

    var s = "";

    for (var i = 0; i < captures.length; i++) {
        s += Ident(1) + captures[i].type + " " + captures[i].name + " = ((" + name + "*) _data)->" + captures[i].name + ";\n";
    }

    s += Ident(1) + GenerateTargetTypeVar(source.firstCall) + " = ((" + name + "*) _data)->" + "onResult" + ";\n";
    s += Ident(1) + "void* data" + " = ((" + name + "*) _data)->" + "data" + ";\n";

    return s;
}
function GenerateLambdaCall(identation: number,
    info: Call,
    lines1: string,
    source: Source) {
    var s = "";
    var name0 = info.name;
    var name = GetLambdaName(info, name0);

    var ErrorType = "Result";
    var ErrorVar = "result";
    s += "\n";

    s += Ident(identation + 1) + "" + GetCaptureName(info, name0) + "* " + "_cap" + ";\n";
    var capStr = GenerateCaptureNames(info.captures);
    if (capStr != "") {
        capStr += ", ";
    }

    s += Ident(identation + 1) + ErrorVar + " = " + GetCaptureName(info, name0) + "_Init(&_cap, " + capStr + "onResult, data);\n";
    s += Ident(identation + 1) + "if (" + ErrorVar + " == RESULT_OK)\n";
    s += Ident(identation + 1) + "{\n";

    var callargs = ""
    if (info.call != "") {
        callargs = info.call + ", ";
    }
    s += Ident(identation + 2) + name0 + "( " + callargs + name + ", " + "_cap" + ");\n";
    s += lines1;
    s += Ident(1) + "}\n";
    s += Ident(1) + "else\n";
    s += Ident(1) + "{\n";
    s += Ident(2) + GenerateTargetErrorCall(source.firstCall);
    s += Ident(1) + "}\n";
    return s;
}

function GenerateLambda(index: number, infos: Array<Call>, source: Source) {
    var info = infos[index];

    var name0 = info.name;
    var name = GetLambdaName(info, name0);
    var ErrorType = "Result";
    var ErrorVar = "result";

    var spaces = SameSizeOf("static void " + name + "(");
    var s = "";
    var funcargs = GenerateArguments(spaces, info.args);
    if (funcargs != "") {
        funcargs += ", ";
    }
    s += "static void " + name + "(" + ErrorType + " " + ErrorVar + ", " + funcargs + "void* _data)\n";
    s += "{\n";

    s += Ident(1) + "//capture vars\n";
    s += GenerateCaptureLocal(info, info.captures, source);
    s += "\n";
    s += "\n";
    s += Ident(1) + "if (" + ErrorVar + " == RESULT_OK)\n";
    s += Ident(1) + "{\n";
    if (index < infos.length - 1) {
        s += Ident(2) + "//continuation\n";
        s += GenerateLines(2, info.currentLine0, info.lines0);
        var lines1 = GenerateLines(2, info.currentLine1, info.lines1);
        s += GenerateLambdaCall(1, infos[index + 1], lines1, source);

        s += Ident(1) + "} //if\n";
    }
    else {
        s += Ident(2) + "//succeded!!\n";

        var targetResultsStr = source.firstCall.call;
        if (targetResultsStr != "") {
            //se tem call eh pq tem um resultado
            //deve ser chamado com return
            s += GenerateLines(2, info.currentLine0, info.lines0);
            targetResultsStr += ", ";
            s += Ident(2) + "onResult(result, " + targetResultsStr + "data); //target\n";
            s += GenerateLines(2, info.currentLine1, info.lines1);
            //s += Ident(1) + "}\n";
        }
        else {
            //provamente nao tem return
            //neste caso se inverte e coloca o lines1 antes do onresult

            //deve ser branco
            s += GenerateLines(2, info.currentLine0, info.lines0);

            //este aqui pode ter coisas e vem antes do return
            s += GenerateLines(2, info.currentLine1, info.lines1);

            //fica bem no fim simulando o retorno
            s += Ident(2) + "onResult(result, data); //target no result\n";
            s += Ident(1) + "}\n";
        }
        s += Ident(1) + "else\n";
        s += Ident(1) + "{\n";
        s += Ident(2) + GenerateTargetErrorCall(source.firstCall);
        s += Ident(1) + "}//else\n";
    }



    s += "\n";
    s += Ident(1) + GetCaptureName(info, name0) + "_Destroy((" + GetCaptureName(info, name0) + "*)" + "_data);\n";
    s += "} //lambda\n\n";

    return s;
}

function Generate(source: Source) {
    var strResult = "";

    var s = "";

    for (var i = (source.calls.length - 1); i >= 0; i--) {
        s += GenerateCapture(0, source.calls[i], source);
        s += GenerateLambda(i, source.calls, source);
    }

    s += "\n\n\n";

    var spaces = SameSizeOf("Result " + source.firstCall.name + "(");
    var captureStr = GenerateArguments(spaces, source.firstCall.captures);
    if (captureStr != "") {
        captureStr += ",\n" + spaces;
    }
    s += "void " + source.firstCall.name + "(" + captureStr + GenerateTargetTypeVar(source.firstCall) + ",\n" + spaces + "void* data" + ")\n";
    s += "{\n";
    s += Ident(1) + "Result result;\n";

    s += GenerateLines(1, source.firstCall.currentLine0, source.firstCall.lines0);
    var lines1 = GenerateLines(1, source.firstCall.currentLine1, source.firstCall.lines1);
    s += GenerateLambdaCall(0, source.calls[0], lines1, source);

    s += "}\n";
    strResult = s;
    return strResult;
}

function ParseFunctionResult(scanner: Scanner) {
    var typesAndNames = new Array<TypeAndName>();
    scanner.SkipBlanks();
    scanner.MatchToken("-");
    scanner.MatchToken(">");
    scanner.SkipBlanks();
    if (scanner.lexeme == "void") {
        //pode ser sem retorno
        scanner.MatchLexeme("void");
        scanner.SkipBlanks();
        if (scanner.token != '{') {
            var typename = "void";
            var modifier = "";
            var pointer = "";
            scanner.SkipBlanks();
            if (scanner.token == "*") {
                pointer = scanner.MatchToken("*");
                scanner.SkipBlanks();
            }

            var name = scanner.MatchToken("identifier");
            scanner.SkipBlanks();
            typesAndNames.push({ "type": modifier + typename + pointer, "name": name });
        }
    }
    else {
        //normal
        typesAndNames.push(ParseTypeAndName(scanner));
        if (scanner.token == ",") {
            scanner.MatchToken(",");
        }
    }
    while (scanner.token != "{") {
        typesAndNames.push(ParseTypeAndName(scanner));
        if (scanner.token == "{") {
            break;
        }
        else if (scanner.token == ",") {
            scanner.MatchToken(",");
        }
        else {
            throw "expected , or }";
        }
    }
    scanner.MatchToken("{");
    scanner.SkipBlanks();
    return typesAndNames;
}

function ParseTypeAndName(scanner: Scanner) {
    scanner.SkipBlanks();
    var modifier = "";
    var pointer = "";

    if (scanner.lexeme == "const" ||
        scanner.lexeme == "unsigned") {
        var modifier = scanner.MatchToken("identifier");
        modifier += " ";
        scanner.SkipBlanks();
    }

    var typename = scanner.MatchToken("identifier");
    scanner.SkipBlanks();

    if (scanner.token == "*") {
        pointer = scanner.MatchToken("*");
        scanner.SkipBlanks();
    }

    var name = scanner.MatchToken("identifier");
    scanner.SkipBlanks();
    return { "type": modifier + typename + pointer, "name": name };
}

function ParseAsyncCallAndDeclaration(scanner: Scanner, call: Call) {

    scanner.MatchLexeme("async");
    scanner.SkipBlanks();


    scanner.MatchLexeme("[");
    while (scanner.token != "]") {
        call.captures.push(ParseTypeAndName(scanner));

        if (scanner.token == "]") {
        }
        else if (scanner.token == ",") {
            scanner.MatchToken(",");
            scanner.SkipBlanks();
        }
        else {
            throw "expected , or )";
        }
    }//captures
    scanner.MatchToken("]");
    scanner.SkipBlanks();

    call.name = scanner.MatchToken("identifier");


    scanner.SkipBlanks();
    scanner.MatchToken("(");
    scanner.SkipBlanks();
    var callStr = "";
    for (; ;) {
        if (scanner.token == ")") {
            scanner.MatchToken(")");
            break;
        }
        callStr += scanner.lexeme;
        scanner.Next();
    }
    call.call = callStr;
    call.args = ParseFunctionResult(scanner);
}

function ParseAsyncBody(scanner: Scanner,
    originBodyCall: Call,
    sourceOut: Source) {
    var functionBodyStartLine = scanner.currentLine;
    var functionBodyEndLine = 0;
    var blockCount = 1;

    var lines = "";
    for (; ;) {
        if (scanner.lexeme == "return") {
            originBodyCall.currentLine0 = functionBodyStartLine;
            originBodyCall.lines0 = lines;

            lines = "";

            scanner.MatchLexeme("return");
            scanner.SkipBlanks();
            sourceOut.firstCall.call = "";
            for (; ;) {
                if (scanner.token != ';') {
                    //?
                    sourceOut.firstCall.call += scanner.lexeme;
                }
                else {
                    break;
                }
                scanner.Next();
            }
            scanner.MatchToken(';');
            scanner.SkipBlanks();
        }
        else if (scanner.lexeme == "async") {
            originBodyCall.currentLine0 = functionBodyStartLine;
            originBodyCall.lines0 = lines;

            var call = new Call();
            lines = "";
            sourceOut.calls.push(call);
            ParseAsyncCallAndDeclaration(scanner, call);
            ParseAsyncBody(scanner, call, sourceOut);
        }
        else if (scanner.token == "}") {
            blockCount--;
            if (blockCount <= 0) {
                //entende que a ultima chave fechada
                //fecha o body da funcao                
                scanner.MatchToken('}');
                scanner.SkipBlanks();
                functionBodyEndLine = scanner.currentLine;
                break;
            }
            else {
                lines += scanner.lexeme;
                scanner.Next();
            }
        }
        else {
            if (scanner.token == "{") {
                blockCount++;
            }
            lines += scanner.lexeme;
            scanner.Next();
        }

        if (scanner.token == "eof") {
            break;
        }
    }
    originBodyCall.currentLine1 = functionBodyStartLine;
    originBodyCall.lines1 = lines;
}

function Parse(inputSource: string): string {
    var strResult = "";
    var manySources = new Array<Source>();


    //try
    //{
    var scanner = new Scanner(inputSource);
    // var lines = "";
    for (; ;) {
        var sourceOut = new Source();




        if (scanner.lexeme == "async") {
            //            scanner.SkipBlanks();
            scanner.MatchLexeme("async");
            scanner.SkipBlanks();
            sourceOut.firstCall.name = scanner.MatchToken("identifier");
            scanner.SkipBlanks();
            scanner.MatchToken("(");
            scanner.SkipBlanks();

            while (scanner.token != ")") {
                //Na funcao principal usa os captures como se fossem os parametros
                sourceOut.firstCall.captures.push(ParseTypeAndName(scanner));

                if (scanner.token == ")") {
                }
                else if (scanner.token == ",") {
                    scanner.MatchToken(",");
                    scanner.SkipBlanks();
                }
                else {
                    throw "expected , or )";
                }
            }//parametros
            scanner.MatchToken(")");
            sourceOut.firstCall.args = ParseFunctionResult(scanner);
            ParseAsyncBody(scanner, sourceOut.firstCall, sourceOut);

            //strResult += lines;
            // lines = "";
            strResult += Generate(sourceOut);
            //;;manySources.push(sourceOut);

            if (scanner.token == "eof") {
                //ok!
                break;
            }
        }//async
        else {
            //se quer ignorar
            //strResult += scanner.lexeme;
            scanner.Next();
        }
        if (scanner.token == "eof") {
            //ok!
            break;
        }
    }//for    

    return strResult;
}

class Scanner {
    stringSource: string;
    current: number;

    lexeme: string;
    token: string;
    currentLine: number;

    constructor(src: string) {
        this.currentLine = 0;
        this.current = 0;
        this.stringSource = src;
        this.Next();
    }

    public MatchLexeme(tk: string) {
        if (this.lexeme != tk) {
            throw "Lexeme expected =" + tk + ", got " + this.token + " " + " " + this.lexeme + " at line " + this.currentLine;
        }
        this.Next();
    }

    public MatchToken(tk: string) {
        var lexeme = this.lexeme;
        if (this.token != tk) {
            throw "Token expected =" + tk + ", got " + this.token + " " + " " + this.lexeme + " at line " + this.currentLine;
        }
        this.Next();
        return lexeme;
    }

    public SkipBlanks() {
        while (this.token != "eof" &&
            (this.token == "whitespace" || this.token == "linebreak")) {
            this.Next();
        }
    }

    public Next() {
        if (this.current == this.stringSource.length - 1) {
            this.lexeme = "";
            this.token = "eof";
            return false;
        }

        var ch = this.stringSource[this.current];

        if (ch == '\n') {
            //incrementa a linha
            this.currentLine++;

            this.current++;
            this.lexeme = '\n';
            this.token = "linebreak";
            return true;
        }

        var whitespace = "";
        while (ch == ' ' || ch == '\n' || ch == '\r' || ch == '\t') {
            whitespace += ch;
            this.current++;
            ch = this.stringSource[this.current];
        }
        if (whitespace != "") {
            this.lexeme = whitespace;
            this.token = "whitespace";
            return true;
        }

        var identifier = "";
        if ((ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z') ||
            (ch == '_')) {
            while ((ch >= 'a' && ch <= 'z') ||
                (ch >= 'A' && ch <= 'Z') ||
                (ch >= '0' && ch <= '9') ||
                (ch == '_')) {
                identifier += ch;
                this.current++;
                ch = this.stringSource[this.current];
            }
        }

        if (identifier != "") {
            this.lexeme = identifier;
            this.token = "identifier";
            return true;
        }

        var lineComment = "";
        if (ch == "/") {
            //tenta olhar um adiante
            if (this.current + 1 < this.stringSource.length) {
                if (this.stringSource[this.current + 1] == "/") {
                    lineComment = "";
                    //comentario de linha!
                    while (ch != '\n') {
                        lineComment += ch;
                        this.current++;
                        ch = this.stringSource[this.current];
                    }
                }
            }
        }
        if (lineComment != "") {
            this.lexeme = lineComment;
            this.token = "comment";
            return true;
        }

        var strliteral = "";
        if (ch == "\"") {
            strliteral += ch;
            this.current++;
            ch = this.stringSource[this.current];

            while (ch != '"') {
                strliteral += ch;
                this.current++;
                ch = this.stringSource[this.current];
                //TODO SCAPE
            }
            strliteral += ch;
            this.current++;
            ch = this.stringSource[this.current];
        }
        if (strliteral != "") {
            this.lexeme = strliteral;
            this.token = "strliteral";
            return true;
        }

        if (this.current >= this.stringSource.length) {
            this.lexeme = "";
            this.token = "eof";
            return false;
        }

        this.current++;
        this.lexeme = ch;
        this.token = ch;//"punctuator";
        return true;
    }

}



//////////////////////////////////////////////
//////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////


var fs = require('fs');
var path = require('path');


if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " SOME_PARAM");
    process.exit(-1);
}

var param = process.argv[2];

sourceFileName = path.basename(param);

var inputSourceText = fs.readFileSync(param, "utf8");
inputSourceText = inputSourceText.toString().replace(/^\uFEFF/, ''); // Strips BOM

var r = "";
//tem que gerar este source
try {    
    r = Parse(inputSourceText);    
    var fileOut = param;
    fileOut = fileOut.replace(".cpp", '_g_.cpp');
    fs.writeFileSync(fileOut, r, 'utf8');
    console.log(fileOut + "\n generated with success!!\n");
}
catch (e) {
    r = e;
    console.log(e);
}

process.exit(0);

