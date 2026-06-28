interface Props {
  onClose: () => void;
}

export default function SceneHeader({ onClose }: Props) {
  return (
    <div className="relative h-36 sm:h-48 shrink-0 overflow-hidden rounded-t-2xl">
      <svg
        viewBox="0 0 800 280"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="s-sky" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0%"   stopColor="#2b4253" />
            <stop offset="50%"  stopColor="#3f6070" />
            <stop offset="100%" stopColor="#5e8799" />
          </linearGradient>
          <radialGradient id="s-moon" cx="40%" cy="36%" r="56%">
            <stop offset="0%"   stopColor="#e2eaef" />
            <stop offset="58%"  stopColor="#c4d3db" />
            <stop offset="100%" stopColor="#b0c3ce" />
          </radialGradient>
          <radialGradient id="s-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(195,218,232,0.28)" />
            <stop offset="100%" stopColor="rgba(195,218,232,0)" />
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect width="800" height="280" fill="url(#s-sky)" />

        {/* Stars */}
        {([
          [52,17,1.1],[88,42,0.7],[136,11,1.2],[180,34,0.8],[224,22,0.95],
          [335,14,0.85],[412,17,1.0],[452,35,0.72],[492,11,1.1],[542,47,0.8],
          [588,21,0.9],[632,40,0.7],[672,14,1.0],[714,33,0.8],[752,47,0.7],
          [376,49,0.7],[696,53,0.7],[644,27,0.65],[500,26,0.8],[560,38,0.65],
        ] as [number,number,number][]).map(([cx,cy,r],i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="white" opacity="0.46" />
        ))}

        <circle cx="310" cy="72" r="96" fill="url(#s-glow)" />
        <circle cx="310" cy="72" r="52" fill="url(#s-moon)" />

        <path d="M 460 58 C 474 46 492 51 501 58 C 510 51 528 46 542 58"
              stroke="white" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
        <path d="M 436 82 C 447 74 459 78 465 83 C 471 78 483 74 494 82"
              stroke="white" strokeWidth="2.0" fill="none" strokeLinecap="round"/>
        <path d="M 510 97 C 518 90 527 94 531 98 C 535 94 544 90 552 97"
              stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round"/>

        <path fill="white" d="
          M -10 300 L -10 202
          C 22 190, 62 173, 100 155
          C 132 140, 168 120, 205 118
          C 224 118, 240 124, 258 135
          C 278 148, 298 165, 320 172
          C 345 179, 380 177, 420 170
          C 452 164, 478 153, 510 155
          C 548 157, 590 168, 800 188
          L 800 300 Z
        "/>

        <path stroke="white" strokeWidth="1.0" fill="none" opacity="0.88" d="M -10 193 C 20 181, 60 164, 98 146 C 130 131, 166 111, 203 110 C 222 110, 238 116, 256 127 C 276 140, 296 157, 318 164 C 343 171, 378 169, 418 162 C 450 156, 476 145, 508 147 C 546 149, 588 160, 800 180"/>
        <path stroke="white" strokeWidth="0.98" fill="none" opacity="0.80" d="M -10 184 C 18 172, 58 155, 95 137 C 127 122, 163 102, 200 102 C 220 102, 236 108, 254 119 C 274 132, 294 149, 316 156 C 341 163, 376 161, 416 154 C 448 148, 474 137, 506 139 C 544 141, 586 152, 800 172"/>
        <path stroke="white" strokeWidth="0.95" fill="none" opacity="0.72" d="M -10 175 C 16 163, 55 146, 91 128 C 123 113, 159 93, 197 93 C 217 93, 234 100, 252 111 C 272 124, 292 141, 314 148 C 339 155, 374 153, 414 146 C 446 140, 472 129, 504 131 C 542 133, 584 144, 800 164"/>
        <path stroke="white" strokeWidth="0.92" fill="none" opacity="0.65" d="M -5 166 C 14 154, 52 137, 87 119 C 119 104, 155 84, 193 84 C 214 85, 231 92, 249 103 C 269 116, 290 133, 311 140 C 336 147, 372 145, 411 138 C 443 132, 469 121, 501 123 C 539 125, 582 136, 800 156"/>
        <path stroke="white" strokeWidth="0.90" fill="none" opacity="0.58" d="M 10 157 C 24 146, 50 129, 82 111 C 113 96, 150 76, 188 76 C 210 77, 228 84, 247 95 C 267 108, 288 125, 309 132 C 334 139, 369 137, 408 130 C 440 124, 466 113, 498 116 C 536 118, 580 129, 800 148"/>
        <path stroke="white" strokeWidth="0.87" fill="none" opacity="0.52" d="M 28 148 C 40 137, 62 121, 76 103 C 103 88, 143 68, 182 68 C 205 69, 225 76, 244 87 C 264 100, 285 117, 306 124 C 331 131, 367 129, 406 122 C 437 116, 463 105, 495 108 C 533 110, 578 121, 800 140"/>
        <path stroke="white" strokeWidth="0.84" fill="none" opacity="0.46" d="M 50 139 C 60 129, 74 114, 82 96 C 96 81, 130 62, 175 61 C 200 62, 221 69, 241 80 C 261 93, 282 110, 303 116 C 328 123, 364 121, 403 114 C 434 108, 460 97, 492 100 C 530 102, 576 113, 800 132"/>
        <path stroke="white" strokeWidth="0.81" fill="none" opacity="0.40" d="M 76 130 C 84 121, 92 108, 96 90 C 104 74, 122 57, 168 56 C 194 57, 216 64, 237 75 C 257 88, 279 104, 299 110 C 324 116, 360 114, 399 107 C 430 101, 456 90, 489 93 C 527 95, 574 106, 800 124"/>
        <path stroke="white" strokeWidth="0.78" fill="none" opacity="0.34" d="M 104 121 C 110 113, 116 101, 116 84 C 118 68, 130 52, 162 51 C 189 52, 212 59, 233 70 C 253 83, 275 99, 295 105 C 320 110, 356 108, 395 101 C 426 95, 452 84, 485 87 C 523 89, 571 100, 800 116"/>
        <path stroke="white" strokeWidth="0.75" fill="none" opacity="0.28" d="M 134 112 C 138 106, 140 95, 140 78 C 140 63, 144 49, 158 48 C 184 49, 208 56, 229 67 C 249 79, 272 95, 292 100 C 317 105, 352 103, 391 96 C 422 90, 448 79, 481 82 C 519 84, 568 95, 800 108"/>
        <path stroke="white" strokeWidth="0.72" fill="none" opacity="0.22" d="M 166 103 C 168 98, 166 88, 164 72 C 162 58, 158 47, 155 46 C 181 47, 205 54, 226 65 C 246 77, 269 92, 289 97 C 314 101, 349 99, 388 92 C 419 86, 445 75, 478 78 C 516 80, 566 91, 800 101"/>
        <path stroke="white" strokeWidth="0.68" fill="none" opacity="0.16" d="M 192 93 C 192 89, 188 80, 184 65 C 180 52, 170 46, 162 46 C 180 47, 202 53, 222 63 C 243 75, 267 90, 287 95 C 312 99, 347 97, 386 90 C 417 84, 443 73, 476 76 C 514 78, 564 89, 800 97"/>
      </svg>

      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 text-white/60 hover:text-white transition-colors"
        aria-label="Close"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  );
}
